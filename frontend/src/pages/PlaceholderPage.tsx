interface Props {
  screenNo?: string
  title?: string
}

export default function PlaceholderPage({ screenNo, title }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 select-none">
      <div className="text-6xl mb-4">🚧</div>
      <div className="text-lg font-semibold">{title ?? '준비 중'}</div>
      {screenNo && (
        <div className="text-sm mt-1 font-mono text-gray-300">[{screenNo}]</div>
      )}
    </div>
  )
}
