import React, { useState } from 'react';
import { X, Copy, Check, Download, Terminal } from 'lucide-react';

interface AppPyCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppPyCodeModal: React.FC<AppPyCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pythonCode = `#!/usr/bin/env python3
"""
NASA C-MAPSS Turbofan Predictive Maintenance Platform
=====================================================
Single-file, production-grade interactive digital twin and venture jury pitch dashboard.

Requirements:
    pip install streamlit torch plotly pandas numpy scikit-learn

Execution:
    streamlit run app.py
"""

import math
import time
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import streamlit as st
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler

# Complete script is located in /app.py in this repository root!
# Run: streamlit run app.py
`;

  const handleCopy = () => {
    fetch('/app.py')
      .then((res) => (res.ok ? res.text() : pythonCode))
      .catch(() => pythonCode)
      .then((text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const handleDownload = () => {
    fetch('/app.py')
      .then((res) => (res.ok ? res.text() : pythonCode))
      .catch(() => pythonCode)
      .then((text) => {
        const blob = new Blob([text], { type: 'text/x-python' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'app.py';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2e3230]/40 backdrop-blur-sm font-body">
      <div className="bg-surface border border-surface-container-highest rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-on-surface">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-highest bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-headline font-semibold text-on-surface">
              Self-Contained Executable · app.py (Streamlit + PyTorch)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-secondary hover:text-on-surface rounded-xl hover:bg-surface-container transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions banner */}
        <div className="bg-surface-container-low px-6 py-3 border-b border-surface-container-highest flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-on-surface">
          <div>
            <span className="text-secondary">Run locally: </span>
            <code className="text-primary bg-surface px-2 py-0.5 rounded border border-surface-container-highest">
              pip install streamlit torch plotly pandas numpy scikit-learn &amp;&amp; streamlit run app.py
            </code>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surface-container-high text-on-surface rounded-xl text-xs font-semibold transition-colors border border-surface-container-highest shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy app.py'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl text-xs transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-on-surface bg-surface-container-lowest">
          <pre className="whitespace-pre-wrap leading-relaxed select-all">
{`# Setup: pip install streamlit torch plotly pandas numpy scikit-learn
# Run: streamlit run app.py

import numpy as np
import pandas as pd
import streamlit as st
import torch
import torch.nn as nn
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Full PyTorch Pipeline & Streamlit UI is stored in /app.py in this repository root!
# It runs with zero cold-start delay (<3s inline fitting) and provides full interactive
# telemetry scrubbing, dual Plotly diagnostic charts, and NASA asymmetric penalty scoring.`}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-surface-container-highest flex items-center justify-between text-xs text-secondary font-mono bg-surface">
          <span>File size: ~23 KB · Single standalone file</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl font-semibold transition-colors border border-surface-container-highest"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
