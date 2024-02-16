import { Activity, Dimensions } from 'utils/types'
import './index.scss'
import * as d3 from 'd3'
import { useEffect, useRef } from 'react'
import { downScale, getRange } from 'utils/helpers'

type Props = {
  content: Activity
  dimensions: Dimensions
}

type MouseOverProps = {
  d: { kilogram: number; calories: number }
  i: number
}

export default function ActivityGraph({ content, dimensions }: Props) {
  const weightMinMax: any[] = d3.extent(content.sessions.map((s) => s.kilogram))
  // weightMinMax = [76, 81]
  const caloriesMinMax: any[] = d3.extent(
    content.sessions.map((s) => s.calories),
  )
  const weightTicks =
    d3.max(content.sessions.map((s) => s.kilogram as any)) -
    d3.min(content.sessions.map((s) => s.kilogram as any))
  // weightTicks = 5
  const weightRange = getRange(weightMinMax)
  // weightRange = [76, 77, 78, 79, 80, 81]
  const { width, height, marginTop, marginRight, marginBottom, marginLeft } =
    dimensions
  const strokeWidth = 7,
    barOffset = 7,
    gx = useRef<SVGGElement | any>(null),
    gy = useRef<SVGGElement | any>(null),
    tooltipDiv = useRef<HTMLDivElement>(null),
    tooltipWeight = useRef<HTMLSpanElement>(null),
    tooltipCalories = useRef<HTMLSpanElement>(null),
    barsRefs = useRef<SVGGElement[]>([])
  // Declare the x (horizontal position) scale with dates from sessions.
  const x = d3.scaleLinear(
    [1, content.sessions.length],
    [marginLeft, width - marginRight],
  )
  // Declare the y (vertical position) scale from weight.
  const weightYscale = d3.scaleLinear(weightMinMax, [
    height - marginBottom,
    marginTop,
  ])

  const caloriesYscale = d3.scaleLinear(caloriesMinMax, [
    height - marginBottom,
    marginTop,
  ])

  useEffect(
    () => void d3.select(gx.current).call(d3.axisBottom(x).ticks(weightTicks)),
    [gx, x, weightTicks],
  )
  useEffect(
    () =>
      void d3
        .select(gy.current)
        .call(d3.axisRight(weightYscale).ticks(weightTicks)),
    [gy, weightYscale, weightTicks],
  )

  function mouseOver({ i, d }: MouseOverProps): void {
    const rect = barsRefs.current[i].getElementsByClassName(
      'activity__bars--background',
    )[0] as SVGRectElement
    rect.style.opacity = '1'
    tooltipDiv!.current!.style.display = 'flex'
    tooltipWeight!.current!.textContent = `${d.kilogram}kg`
    tooltipCalories!.current!.textContent = `${d.calories}Kcal`
  }

  function mouseMove(e: MouseEvent) {
    tooltipDiv!.current!.style.left = `${e.pageX + 10}px`
    tooltipDiv!.current!.style.top = `${e.pageY - 10}px`
  }

  function mouseLeave(i: number) {
    const rect = barsRefs.current[i].getElementsByClassName(
      'activity__bars--background',
    )[0] as SVGRectElement
    rect.style.opacity = '0'
    tooltipDiv!.current!.style.display = 'none'
  }

  return (
    <>
      <div id="activity__tooltip" ref={tooltipDiv}>
        <span id="activity__tooltip--weight" ref={tooltipWeight}></span>
        <span id="activity__tooltip--calories" ref={tooltipCalories}></span>
      </div>
      <svg className="activity" width={width} height={height}>
        <defs>
          <clipPath id="cut-off-bottom">
            <rect x={0} y={0} width={width} height={height - marginBottom} />
          </clipPath>
        </defs>
        <text
          className="activity__title"
          transform={`translate(${downScale(24)},${downScale(32)})`}
        >
          Activité quotidienne
        </text>
        {/* ------------------------Legend------------------------ */}
        <g
          className="activity__legend"
          transform={`translate(${downScale(500)},${downScale(28)})`}
        >
          <g>
            <circle
              className="activity__legend--weight"
              cx="0"
              cy="0"
              r="4"
              fill="currentColor"
            />
            <text
              className="activity__legend--text"
              transform="translate(8,4)"
              fill="currentColor"
              fontWeight="600"
            >
              Poids (kg)
            </text>
          </g>
          <g transform={`translate(${downScale(110)},0)`}>
            <circle
              className="activity__legend--calories"
              cx="0"
              cy="0"
              r="4"
              fill="currentColor"
            />
            <text
              className="activity__legend--text"
              transform="translate(8,4)"
              fill="currentColor"
              fontWeight="600"
            >
              Calories brûlées (kCal)
            </text>
          </g>
        </g>
        {/* -----------------------Scales-------------------------- */}
        <g
          ref={gx}
          transform={`translate(0,${height - marginBottom + downScale(16)})`}
          className="activity__xscale"
        />
        <g
          className="activity__yticks"
          transform={`translate(0,${height - marginBottom})`}
        >
          <line
            x1={marginLeft - strokeWidth - barOffset / 2}
            x2={width - marginRight + strokeWidth + barOffset / 2}
            y1="0"
            y2="0"
            stroke="currentColor"
            strokeWidth="1"
            key={`yAxis-tick-0`}
          />
          {weightRange.map((tick) => (
            <line
              x1={marginLeft - strokeWidth - barOffset / 2}
              x2={width - marginRight + strokeWidth + barOffset / 2}
              y1={-weightYscale(tick) + marginTop}
              y2={-weightYscale(tick) + marginTop}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2"
              key={`yAxis-tick-${tick}`}
            />
          ))}
        </g>
        <g
          ref={gy}
          transform={`translate(${width - marginRight + downScale(45)},0)`}
          className="activity__yscale"
          key="activity__yscale"
        />
        {/* --------------------Data---------------------- */}
        <g
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="activity__bars"
          key="activity__bars"
        >
          {content.sessions.map((d, i) => (
            <g
              ref={(e) => (barsRefs.current[i] = e as SVGGElement)}
              className="activity__bars--group"
              onMouseOver={() => mouseOver({ i, d })}
              onMouseMove={(e) => mouseMove(e as any)}
              onMouseLeave={() => mouseLeave(i)}
              key={`activity__bars-${i}`}
            >
              <rect
                className="activity__bars--background"
                x={x(i + 1) - barOffset * 3}
                y={marginTop - barOffset}
                height={height - marginBottom - marginTop + barOffset}
                width={downScale(56)}
                stroke="none"
                key={`activity__bars-background-${i}`}
              />
              <line
                key={`activity__weightbar-line-${i}`}
                className="activity__weightbar"
                x1={x(i + 1) - barOffset}
                x2={x(i + 1) - barOffset}
                y1={weightYscale(d.kilogram)}
                y2={height - marginBottom}
              />
              <circle
                key={`activity__weightbar-circle-${i}`}
                className="activity__weightbar"
                cx={x(i + 1) - barOffset}
                cy={weightYscale(d.kilogram)}
                r="0.5"
                strokeWidth={strokeWidth - 1}
                clipPath="url(#cut-off-bottom)"
              />
              <line
                key={`activity__caloriesbar-line-${i}`}
                className="activity__caloriesbar"
                x1={x(i + 1) + barOffset}
                x2={x(i + 1) + barOffset}
                y1={caloriesYscale(d.calories)}
                y2={height - marginBottom}
              />
              <circle
                key={`activity__caloriesbar-circle-${i}`}
                className="activity__caloriesbar"
                cx={x(i + 1) + barOffset}
                cy={caloriesYscale(d.calories)}
                r="0.5"
                strokeWidth={strokeWidth - 1}
                clipPath="url(#cut-off-bottom)"
              />
            </g>
          ))}
        </g>
      </svg>
    </>
  )
}
