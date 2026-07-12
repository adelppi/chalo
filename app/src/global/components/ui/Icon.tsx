import Svg, { Circle, Ellipse, Line, Path, Rect } from "react-native-svg";

// Claude Design の手描き SVG アイコンをそのまま写した独自アイコンセット。
// 外部アイコンフォントは使わない（adr/0016：UIプリミティブは自作）。
export type IconName =
  | "calendar"
  | "calendar-plus"
  | "clock"
  | "link"
  | "note"
  | "pin"
  | "camera"
  | "external"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "plus"
  | "paw"
  | "check-circle"
  | "gear"
  | "pencil"
  | "trash"
  | "copy"
  | "tray-up"
  | "keypad"
  | "bell"
  | "send"
  | "share"
  | "alert-circle"
  | "lock";

type IconProps = {
  name: IconName;
  size?: number;
  color: string;
  /** 塗りつぶし系アイコン（alert-circle）の前景色 */
  accentColor?: string;
};

// viewBox とパスは Claude Design の SVG に一致させる。
export function Icon({ name, size = 16, color, accentColor }: IconProps) {
  switch (name) {
    case "calendar":
      return (
        <Svg width={size} height={size} viewBox="0 0 14 14">
          <Rect
            x={1}
            y={2.5}
            width={12}
            height={10.5}
            rx={2.5}
            fill="none"
            stroke={color}
            strokeWidth={1.6}
          />
          <Line
            x1={4.5}
            y1={1}
            x2={4.5}
            y2={4}
            stroke={color}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <Line
            x1={9.5}
            y1={1}
            x2={9.5}
            y2={4}
            stroke={color}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </Svg>
      );
    case "calendar-plus":
      return (
        <Svg width={size} height={size} viewBox="0 0 14 14">
          <Rect
            x={1}
            y={2.5}
            width={12}
            height={10.5}
            rx={2.5}
            fill="none"
            stroke={color}
            strokeWidth={1.6}
          />
          <Line
            x1={4.5}
            y1={1}
            x2={4.5}
            y2={4}
            stroke={color}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <Line
            x1={9.5}
            y1={1}
            x2={9.5}
            y2={4}
            stroke={color}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <Line
            x1={4.5}
            y1={9}
            x2={9.5}
            y2={9}
            stroke={color}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <Line
            x1={7}
            y1={6.5}
            x2={7}
            y2={11.5}
            stroke={color}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </Svg>
      );
    case "clock":
      return (
        <Svg width={size} height={size} viewBox="0 0 14 14">
          <Circle
            cx={7}
            cy={7}
            r={5.6}
            fill="none"
            stroke={color}
            strokeWidth={1.6}
          />
          <Path
            d="M7 4v3l2 1.5"
            fill="none"
            stroke={color}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </Svg>
      );
    case "link":
      return (
        <Svg width={size} height={size} viewBox="0 0 14 14">
          <Path
            d="M5.8 8.2a2.8 2.8 0 004 .3l2-2a2.8 2.8 0 00-4-4l-1 1M8.2 5.8a2.8 2.8 0 00-4-.3l-2 2a2.8 2.8 0 004 4l1-1"
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </Svg>
      );
    case "note":
      return (
        <Svg width={size} height={size} viewBox="0 0 16 16">
          <Rect
            x={2}
            y={1.5}
            width={12}
            height={13}
            rx={2.5}
            fill="none"
            stroke={color}
            strokeWidth={1.6}
          />
          <Line
            x1={5}
            y1={5.5}
            x2={11}
            y2={5.5}
            stroke={color}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <Line
            x1={5}
            y1={8.5}
            x2={11}
            y2={8.5}
            stroke={color}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <Line
            x1={5}
            y1={11.5}
            x2={8.5}
            y2={11.5}
            stroke={color}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </Svg>
      );
    case "pin":
      return (
        <Svg width={size} height={size} viewBox="0 0 14 14">
          <Path
            d="M7 13S2 8.9 2 5.5A5 5 0 017 1a5 5 0 015 4.5C12 8.9 7 13 7 13z"
            fill="none"
            stroke={color}
            strokeWidth={1.6}
          />
          <Circle
            cx={7}
            cy={5.5}
            r={1.7}
            fill="none"
            stroke={color}
            strokeWidth={1.6}
          />
        </Svg>
      );
    case "camera":
      return (
        <Svg width={size} height={size} viewBox="0 0 20 20">
          <Rect
            x={2}
            y={2}
            width={16}
            height={16}
            rx={4.5}
            fill="none"
            stroke={color}
            strokeWidth={1.7}
          />
          <Circle
            cx={10}
            cy={10}
            r={3.6}
            fill="none"
            stroke={color}
            strokeWidth={1.7}
          />
          <Circle cx={14.6} cy={5.4} r={1.1} fill={color} />
        </Svg>
      );
    case "external":
      return (
        <Svg width={size} height={size} viewBox="0 0 14 14">
          <Path
            d="M5.5 2H3a1.5 1.5 0 00-1.5 1.5V11A1.5 1.5 0 003 12.5h7.5A1.5 1.5 0 0012 11V8.5M8.5 1.5H12.5V5.5M12.2 1.8L6.5 7.5"
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "chevron-down":
      return (
        <Svg width={size} height={(size * 8) / 14} viewBox="0 0 14 8">
          <Path
            d="M1 1l6 6 6-6"
            stroke={color}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "chevron-left":
      return (
        <Svg width={(size * 8) / 14} height={size} viewBox="0 0 8 14">
          <Path
            d="M7 1L1 7l6 6"
            stroke={color}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "chevron-right":
      return (
        <Svg width={(size * 8) / 14} height={size} viewBox="0 0 8 14">
          <Path
            d="M1 1l6 6-6 6"
            stroke={color}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "plus":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M12 4v16M4 12h16"
            stroke={color}
            strokeWidth={2.8}
            strokeLinecap="round"
          />
        </Svg>
      );
    case "paw":
      return (
        <Svg width={size} height={(size * 20) / 24} viewBox="0 0 24 20">
          <Circle cx={5} cy={8} r={2.1} fill={color} />
          <Circle cx={9.6} cy={5.4} r={2.3} fill={color} />
          <Circle cx={14.4} cy={5.4} r={2.3} fill={color} />
          <Circle cx={19} cy={8} r={2.1} fill={color} />
          <Ellipse cx={12} cy={14.2} rx={5.4} ry={4.4} fill={color} />
        </Svg>
      );
    case "check-circle":
      return (
        <Svg width={size} height={size} viewBox="0 0 22 22">
          <Circle
            cx={11}
            cy={11}
            r={8.5}
            fill="none"
            stroke={color}
            strokeWidth={1.8}
          />
          <Path
            d="M7.2 11.2l2.6 2.6 5-5.4"
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "gear":
      return (
        <Svg width={size} height={size} viewBox="0 0 22 22">
          <Circle
            cx={11}
            cy={11}
            r={3.1}
            fill="none"
            stroke={color}
            strokeWidth={1.8}
          />
          <Path
            d="M11 1.8v2.8M11 17.4v2.8M1.8 11h2.8M17.4 11h2.8M4.5 4.5l2 2M15.5 15.5l2 2M17.5 4.5l-2 2M4.5 17.5l2-2"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      );
    case "pencil":
      return (
        <Svg width={size} height={size} viewBox="0 0 18 18">
          <Path
            d="M12.8 2.4l2.8 2.8L6.4 14.4l-3.6.8.8-3.6 9.2-9.2z"
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "trash":
      return (
        <Svg width={size} height={size} viewBox="0 0 18 18">
          <Path
            d="M3 5h12M7 5V3.5A1.5 1.5 0 018.5 2h1A1.5 1.5 0 0111 3.5V5m3 0v9.5A1.5 1.5 0 0112.5 16h-7A1.5 1.5 0 014 14.5V5"
            fill="none"
            stroke={color}
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "copy":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect
            x={8}
            y={8}
            width={12}
            height={12}
            rx={3}
            fill="none"
            stroke={color}
            strokeWidth={2}
          />
          <Path
            d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"
            fill="none"
            stroke={color}
            strokeWidth={2}
          />
        </Svg>
      );
    case "tray-up":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M12 3v13M7 8l5-5 5 5"
            fill="none"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M5 14v4a3 3 0 003 3h8a3 3 0 003-3v-4"
            fill="none"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
        </Svg>
      );
    case "keypad":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect
            x={3}
            y={4}
            width={18}
            height={15}
            rx={4}
            fill="none"
            stroke={color}
            strokeWidth={2}
          />
          <Path
            d="M8 10h.01M12 10h.01M16 10h.01M8 14h8"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
        </Svg>
      );
    case "bell":
      return (
        <Svg width={size} height={size} viewBox="0 0 20 20">
          <Path
            d="M10 2.5a5 5 0 00-5 5v3l-1.5 2.5h13L15 10.5v-3a5 5 0 00-5-5z"
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          <Path
            d="M8.3 15.5a1.8 1.8 0 003.4 0"
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </Svg>
      );
    case "send":
      return (
        <Svg width={size} height={size} viewBox="0 0 22 22">
          <Path
            d="M20 3L9.5 13.5M20 3l-6.5 17-3.9-7.6L2 8.5 20 3z"
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "share":
      return (
        <Svg width={size} height={size} viewBox="0 0 22 22">
          <Path
            d="M15 6.5a2.5 2.5 0 10-2.4-3.1M15 15.5a2.5 2.5 0 10-2.4 3.1M6.5 11a2.5 2.5 0 10-.02.01M13 4.5L8.5 9.5M13 17.5L8.5 12.5"
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "alert-circle":
      return (
        <Svg width={size} height={size} viewBox="0 0 16 16">
          <Circle cx={8} cy={8} r={7} fill={color} />
          <Path
            d="M8 4.5v4M8 11.2v.1"
            stroke={accentColor ?? "#FFFCF5"}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </Svg>
      );
    case "lock":
      return (
        <Svg width={size} height={size} viewBox="0 0 22 22">
          <Rect
            x={4.5}
            y={9.5}
            width={13}
            height={9.5}
            rx={2.5}
            fill="none"
            stroke={color}
            strokeWidth={1.8}
          />
          <Path
            d="M7.5 9.5V7a3.5 3.5 0 017 0v2.5"
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <Circle cx={11} cy={14} r={1.4} fill={color} />
        </Svg>
      );
  }
}
