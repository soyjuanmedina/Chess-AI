/** El usuario debe tener este formato */
export interface Move {
  startSquare: number;
  targetSquare: number;
  type?: string;
}