/**
 * Standard return type for all Server Actions (see ADR-010).
 *
 * Usage in a Server Action:
 *   export async function myAction(): Promise<ActionResult<MyData>> { ... }
 *
 * Usage in a Client Component:
 *   const result = await myAction()
 *   if (result.success) { ... result.data ... }
 *   else { toast.error(result.error) }
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
