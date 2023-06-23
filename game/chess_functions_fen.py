import chess

def get_figures(fen):
	board = chess.Board(fen)
	result = set()
	for move in board.legal_moves:
		piece = board.piece_at(move.from_square)
		result.add(chess.piece_name(piece.piece_type).upper())
	return list(result)

def get_moves(fen, selected_piece):
	board = chess.Board(fen)
	result = set()
	for move in board.legal_moves:
		piece = board.piece_at(move.from_square)
		if chess.piece_name(piece.piece_type).upper() == selected_piece:
			result.add(move.uci())
	return list(result)

# board = chess.Board()

# print(get_figures(board))       # {'KNIGHT', 'PAWN'}
# print(get_moves(board, 'PAWN')) # All possible moves with a pawn
