'use client';

import React, { useState } from 'react';

interface DataPoint {
  xLabel: string;
  candidateScore: number;
  benchmarkScore: number;
  attempts: number;
  xCoord: number;
  yCandidate: number;
  yBenchmark: number;
}

const points: DataPoint[] = [
  { xLabel: 'Jan', candidateScore: 48, benchmarkScore: 70, attempts: 24, xCoord: 25, yCandidate: 155, yBenchmark: 110 },
  { xLabel: 'Feb', candidateScore: 56, benchmarkScore: 70, attempts: 42, xCoord: 70, yCandidate: 138, yBenchmark: 110 },
  { xLabel: 'Mar', candidateScore: 64, benchmarkScore: 70, attempts: 60, xCoord: 115, yCandidate: 122, yBenchmark: 110 },
  { xLabel: 'Apr', candidateScore: 68, benchmarkScore: 70, attempts: 75, xCoord: 160, yCandidate: 114, yBenchmark: 110 },
  { xLabel: 'May', candidateScore: 74, benchmarkScore: 70, attempts: 92, xCoord: 205, yCandidate: 102, yBenchmark: 110 },
  { xLabel: 'Jun', candidateScore: 79, benchmarkScore: 70, attempts: 110, xCoord: 250, yCandidate: 92, yBenchmark: 110 },
  { xLabel: 'Jul', candidateScore: 82, benchmarkScore: 70, attempts: 135, xCoord: 295, yCandidate: 86, yBenchmark: 110 },
  { xLabel: 'Aug', candidateScore: 84, benchmarkScore: 70, attempts: 148, xCoord: 340, yCandidate: 82, yBenchmark: 110 },
  { xLabel: 'Sep', candidateScore: 86, benchmarkScore: 70, attempts: 160, xCoord: 385, yCandidate: 78, yBenchmark: 110 },
  { xLabel: 'Oct', candidateScore: 90, benchmarkScore: 70, attempts: 185, xCoord: 430, yCandidate: 70, yBenchmark: 110 },
  { xLabel: 'Nov', candidateScore: 92, benchmarkScore: 70, attempts: 195, xCoord: 475, yCandidate: 66, yBenchmark: 110 },
  { xLabel: 'Dec', candidateScore: 96, benchmarkScore: 70, attempts: 210, xCoord: 520, yCandidate: 58, yBenchmark: 110 },
];

export default function InteractiveWaveChart({
  title = 'Candidate Performance Vs Exit Exam Benchmark',
  subtitle = 'Progressive accuracy compared to Ministry passing threshold',
}: {
  title?: string;
  subtitle?: string;
}) {
  const [activePointIndex, setActivePointIndex] = useState<number>(9);
  const [selectedStream, setSelectedStream] = useState('All Streams');

  const activePoint = points[activePointIndex];

  // Electric Azure candidate score curve (like Amount YTD in image)
  const candidatePath = `
    M 25,155
    C 45,145 55,138 70,138
    C 90,138 100,122 115,122
    C 135,122 145,114 160,114
    C 180,114 190,102 205,102
    C 225,102 235,92 250,92
    C 270,92 280,86 295,86
    C 315,86 325,82 340,82
    C 360,82 370,78 385,78
    C 405,78 415,70 430,70
    C 450,70 460,66 475,66
    C 495,66 505,58 520,58
  `;

  // Deep Navy benchmark comparison line (like Amount LastYear in image)
  const benchmarkPath = `
    M 25,165
    C 50,162 70,164 115,160
    C 160,156 205,158 250,154
    C 295,150 340,146 385,152
    C 430,158 475,160 520,150
  `;

  return (
    <div className="clean-card" style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0A2540' }}>
            {title}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={selectedStream}
            onChange={(e) => setSelectedStream(e.target.value)}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #00A3C4',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '11.5px',
              fontWeight: 600,
              color: '#0A2540',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option>All Streams</option>
            <option>Computer Science</option>
            <option>Medicine & Health</option>
            <option>Electrical Eng.</option>
          </select>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '210px' }}>
        {/* Hairline Grid lines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pointerEvents: 'none',
            paddingBottom: '24px',
          }}
        >
          {['100%', '75%', '50%', '25%', '0%'].map((label, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
              }}
            >
              <span style={{ fontSize: '10px', color: '#9FB3C8', width: '32px', textAlign: 'right', fontWeight: 600 }}>
                {label}
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#EDF2F9' }} />
            </div>
          ))}
        </div>

        {/* SVG Curve with Colors from Image */}
        <svg
          viewBox="0 0 545 220"
          style={{
            width: 'calc(100% - 44px)',
            marginLeft: '44px',
            height: '100%',
            overflow: 'visible',
          }}
        >
          {/* Vertical target indicator at active point */}
          {activePoint && (
            <line
              x1={activePoint.xCoord}
              y1={40}
              x2={activePoint.xCoord}
              y2={190}
              stroke="#CBD5E1"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* Deep Navy Baseline (Amount LastYear in image) */}
          <path
            d={benchmarkPath}
            fill="none"
            stroke="#0A2540"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Deep Navy points */}
          {points.map((pt, idx) => (
            <circle
              key={`bm-${idx}`}
              cx={pt.xCoord}
              cy={150 + ((idx % 3) * 4) - 2}
              r={2.5}
              fill="#0A2540"
            />
          ))}

          {/* Electric Azure Line (Amount YTD in image) */}
          <path
            d={candidatePath}
            fill="none"
            stroke="#0066F5"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Electric Azure Interactive Points */}
          {points.map((pt, index) => {
            const isActive = index === activePointIndex;
            return (
              <g
                key={`cand-${index}`}
                onClick={() => setActivePointIndex(index)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={pt.xCoord} cy={pt.yCandidate} r={16} fill="transparent" />
                {isActive && (
                  <circle
                    cx={pt.xCoord}
                    cy={pt.yCandidate}
                    r={9}
                    fill="rgba(0, 102, 245, 0.2)"
                    stroke="#0066F5"
                    strokeWidth="1"
                  />
                )}
                <circle
                  cx={pt.xCoord}
                  cy={pt.yCandidate}
                  r={isActive ? 5 : 3.5}
                  fill="#0066F5"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              </g>
            );
          })}
        </svg>

        {/* Minimal Executive Tooltip */}
        {activePoint && (
          <div
            style={{
              position: 'absolute',
              left: `calc(44px + ${(activePoint.xCoord / 545) * 100}% - 40px)`,
              top: `${activePoint.yCandidate - 42}px`,
              backgroundColor: '#0A2540',
              color: '#FFFFFF',
              borderRadius: '6px',
              padding: '5px 12px',
              boxShadow: '0 6px 16px rgba(10, 37, 64, 0.25)',
              pointerEvents: 'none',
              transform: 'translate(-50%, -50%)',
              whiteSpace: 'nowrap',
              zIndex: 10,
              fontSize: '11px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0066F5' }} />
              <strong>{activePoint.candidateScore}%</strong> Accuracy • {activePoint.attempts} attempts
            </div>
          </div>
        )}

        {/* X-Axis */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginLeft: '44px',
            marginTop: '2px',
          }}
        >
          {points.map((pt, idx) => (
            <span key={idx} style={{ fontSize: '10px', color: '#627D98', fontWeight: 600 }}>
              {pt.xLabel}
            </span>
          ))}
        </div>
      </div>

      {/* Legend below the chart directly matching the image */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-hairline)',
          fontSize: '11.5px',
          fontWeight: 600,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0066F5' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0066F5' }} />
          <span>Candidate Score Accuracy (YTD)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0A2540' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0A2540' }} />
          <span>National Passing Benchmark (Last Year)</span>
        </div>
      </div>
    </div>
  );
}
