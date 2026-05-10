import { canExecuteAction } from './actionGate.js';
import {
  getAgencyActionContract,
  inputHasExplicitConfirmation,
  resolveGateActionClass,
  type AgencyActionContract,
} from './agencyActionRegistry.js';
import { recordAgencyActionEvent } from './agencyAuditLog.js';
import { createStagedAction } from './agencyStagedActions.js';
import { executeTool } from './tools.js';

function parseJsonResult(result: string): any {
  try {
    return JSON.parse(result);
  } catch {
    return { raw: result };
  }
}

function summarizeStagedAction(contract: AgencyActionContract, input: Record<string, any>): string {
  const pieces = [contract.label];
  if (input.dealId) pieces.push(`deal ${input.dealId}`);
  if (input.deliverableId) pieces.push(`deliverable ${input.deliverableId}`);
  if (input.documentId) pieces.push(`document ${input.documentId}`);
  if (input.recipientEmail) pieces.push(`recipient ${input.recipientEmail}`);
  return pieces.join(' · ');
}

function stagedActionPayload(
  toolName: string,
  input: Record<string, any>,
  contract: AgencyActionContract,
  stagedActionId?: number | null,
) {
  return {
    success: false,
    governed: true,
    staged: true,
    requires_confirmation: true,
    tool: toolName,
    staged_action: {
      id: stagedActionId ?? null,
      toolName,
      label: contract.label,
      permissionLevel: contract.permissionLevel,
      riskLevel: contract.riskLevel,
      writeScope: contract.writeScope,
      summary: summarizeStagedAction(contract, input),
      input,
      confirmWith: { ...input, confirmed: true },
      confirmEndpoint: stagedActionId ? `/api/agency/actions/${stagedActionId}/confirm` : null,
      cancelEndpoint: stagedActionId ? `/api/agency/actions/${stagedActionId}/cancel` : null,
    },
    message: `${contract.label} is staged, not executed. Ask the user to confirm before taking this action.`,
  };
}

export async function executeGovernedTool(
  toolName: string,
  input: Record<string, any>,
  userId: number,
  conversationId: number,
): Promise<string> {
  const contract = getAgencyActionContract(toolName);

  if (!contract) {
    const result = {
      success: false,
      governed: true,
      blocked: true,
      error: `No agency action contract exists for tool: ${toolName}`,
      message: 'This tool is not registered in the Yulia execution layer, so it cannot run yet.',
    };
    await recordAgencyActionEvent({
      userId,
      conversationId,
      toolName,
      outcome: 'blocked',
      input,
      result,
      reason: 'missing_action_contract',
    });
    return JSON.stringify(result);
  }

  if (contract.confirmation === 'required' && !inputHasExplicitConfirmation(input)) {
    const staged = await createStagedAction({ userId, conversationId, contract, input });
    const result = stagedActionPayload(toolName, input, contract, staged?.id ?? null);
    await recordAgencyActionEvent({
      userId,
      conversationId,
      toolName,
      contract,
      outcome: 'staged',
      input,
      result,
      reason: 'confirmation_required',
    });
    return JSON.stringify(result);
  }

  const actionClass = resolveGateActionClass(contract, input);
  const gateDeliverableId = input.deliverableId ?? input.loiDeliverableId;
  if (actionClass && input.dealId && (gateDeliverableId || input.documentId)) {
    const gate = await canExecuteAction({
      action: actionClass,
      dealId: Number(input.dealId),
      deliverableId: gateDeliverableId ? Number(gateDeliverableId) : undefined,
      documentId: input.documentId ? Number(input.documentId) : undefined,
    });

    if (!gate.allowed) {
      const result = {
        success: false,
        governed: true,
        blocked: true,
        action_gate: gate,
        message: gate.reason || 'This action is blocked until the required status and signoff chain is complete.',
      };
      await recordAgencyActionEvent({
        userId,
        conversationId,
        toolName,
        contract,
        outcome: 'blocked',
        input,
        result,
        reason: gate.reason,
      });
      return JSON.stringify(result);
    }
  }

  try {
    const result = await executeTool(toolName, input, userId, conversationId);
    const parsedResult = parseJsonResult(result);
    await recordAgencyActionEvent({
      userId,
      conversationId,
      toolName,
      contract,
      outcome: parsedResult?.error ? 'error' : 'executed',
      input,
      result: parsedResult,
      reason: parsedResult?.error,
    });
    return result;
  } catch (err: any) {
    const result = {
      success: false,
      governed: true,
      error: err.message,
    };
    await recordAgencyActionEvent({
      userId,
      conversationId,
      toolName,
      contract,
      outcome: 'error',
      input,
      result,
      reason: err.message,
    });
    return JSON.stringify(result);
  }
}
