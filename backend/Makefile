.PHONY: install run test clean

install:
	uv sync

run:
	uv run python main.py

test:
	uv run pytest

clean:
	rm -rf .venv .pytest_cache
	find . -type d -name "__pycache__" -exec rm -rf {} +
