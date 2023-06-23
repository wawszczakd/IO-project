import chess

def get_figures(fen):
	board = chess.Board(fen)
	result = set()
	for move in board.legal_moves:
		piece = board.piece_at(move.from_square)
		result.add(chess.piece_symbol(piece.piece_type).lower())
	return list(result)

def get_moves(fen, selected_piece):
	board = chess.Board(fen)
	result = set()
	for move in board.legal_moves:
		piece = board.piece_at(move.from_square)
		if chess.piece_symbol(piece.piece_type).lower() == selected_piece:
			result.add(move.uci())
	return list(result)
