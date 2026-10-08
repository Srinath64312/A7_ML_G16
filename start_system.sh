#!/usr/bin/env bash
set -e

echo "========================================================================="
echo "   Personalized AI Tutor - State Level ML Project Expo 2026 Launcher"
echo "========================================================================="
echo ""

echo "[1/3] Checking Python environment..."
python3 --version || python --version

echo ""
echo "[2/3] Verifying Backend Dependencies & Tests..."
pytest backend/tests -q || python3 -m pytest backend/tests -q || true

echo ""
echo "[3/3] Starting Unified AI Tutor Platform on http://localhost:5000 ..."
python3 run.py || python run.py
