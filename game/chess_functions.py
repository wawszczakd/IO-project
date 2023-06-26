import chess

def get_figures(board):
	result = set()
	for move in board.legal_moves:
		piece = board.piece_at(move.from_square)
		result.add(chess.piece_name(piece.piece_type).upper())
	return list(result)

def get_moves(board, selected_piece):
	result = set()
	for move in board.legal_moves:
		piece = board.piece_at(move.from_square)
		if chess.piece_name(piece.piece_type).upper() == selected_piece:
			result.add(move.uci())
	return list(result)

def get_legal_moves(fen):
	board = chess.Board(fen)
	moves = []
	for move in board.legal_moves:
		moves.append(move.uci())
	return moves

