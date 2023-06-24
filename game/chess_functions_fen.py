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

def is_finished(fen):
	board = chess.Board(fen)
	
	if board.is_checkmate():
		result = "checkmate"
	elif board.is_stalemate():
		result = "stalemate"
	elif board.is_insufficient_material():
		result = "insufficient material"
	elif board.is_seventyfive_moves():
		result = "seventy-five moves rule"
	elif board.is_fivefold_repetition():
		result = "fivefold repetition"
	elif board.is_variant_draw():
		result = "variant draw"
	else:
		result = "in progress"
	
	if result == "checkmate":
		winner = "Black" if board.turn == chess.WHITE else "White"
		return f"{winner} won the game!"
	elif result == "stalemate" or result == "insufficient material" or result == "seventy-five moves rule" or result == "fivefold repetition" or result == "variant draw":
		return "The game ended in a draw."
	else:
		return "The game is still in progress."