import { useEffect, useState } from "react";

export const App: React.FC = () => {
  // サーバから取得してきた状態です。
  const [state, setState] = useState();

  useEffect(() => {
    // 1 秒に 1 回 API を叩いて、サーバから状態を取得します。
    setInterval(() => {
      fetch("/api/state")
        .then((res) => res.json())
        .then((state) => setState(state));
    }, 1000);
  }, []);

  if (!state) {
    return (
      <>
        <h1>flask-react-example</h1>
        <p>Loading...</p>
      </>
    );
  }

  // 線路の座標です。
  const points = [
    { x: 50, y: 50 },
    { x: 50, y: 250 },
    { x: 350, y: 250 },
    { x: 350, y: 50 },
    { x: 50, y: 50 },
  ];

  // t0 の位置と向きを計算します。
  const t0 = calculatePositionAndDirection(
    state["trains"]["t0"]["mileage"] / 100.0,
    points,
  );

  return (
    <>
      <h1>flask-react-example</h1>
      <svg width={400} height={300}>
        {/* 背景 */}
        <rect width={400} height={300} fill="#000000" />

        {/* 線路 */}
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          stroke="#ffffff"
        />

        {/* 列車（<g></g> で囲んで移動と回転の変形をかけます。） */}
        <g
          transform={`translate(${t0.position.x}, ${t0.position.y}) rotate(${(t0.direction / Math.PI) * 180})`}
        >
          <polygon points="10,0 -10,-10 -10,10 10,0" fill="#ff0000" />
        </g>
      </svg>
    </>
  );
};

// 線路の始点を 0、終点を 1 としたときの割合から、路線図上での位置と向きを計算します。
export const calculatePositionAndDirection = (
  ratio: number,
  points: { x: number; y: number }[],
): {
  position: { x: number; y: number };
  direction: number;
} => {
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p = points[i];
    const q = points[i + 1];
    const lineLength = Math.hypot(q.x - p.x, q.y - p.y);
    totalLength += lineLength;
  }
  let targetLength = totalLength * ratio;
  if (targetLength < 0) {
    const p = points[0];
    const q = points[1];
    return {
      position: p,
      direction: Math.atan2(q.y - p.y, q.x - p.x),
    };
  }
  for (let i = 0; i < points.length - 1; i++) {
    const p = points[i];
    const q = points[i + 1];
    const lineLength = Math.hypot(q.x - p.x, q.y - p.y);
    if (targetLength >= lineLength) {
      targetLength -= lineLength;
    } else {
      return {
        position: {
          x: p.x + (q.x - p.x) * (targetLength / lineLength),
          y: p.y + (q.y - p.y) * (targetLength / lineLength),
        },
        direction: Math.atan2(q.y - p.y, q.x - p.x),
      };
    }
  }
  {
    const p = points[points.length - 2];
    const q = points[points.length - 1];
    return {
      position: q,
      direction: Math.atan2(q.y - p.y, q.x - p.x),
    };
  }
};
