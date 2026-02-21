"use client";

const EXAMPLES: { label: string; emoji: string; code: string }[] = [
  {
    label: "카운터",
    emoji: "🔢",
    code: `"use client"

import { useState } from "react"

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>카운터: {count}</h1>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>초기화</button>
    </div>
  )
}`,
  },
  {
    label: "Todo 리스트",
    emoji: "📝",
    code: `"use client"

import { useState } from "react"

export default function TodoList() {
  const [todos, setTodos] = useState<string[]>([])
  const [input, setInput] = useState("")

  const addTodo = () => {
    if (!input.trim()) return
    setTodos([...todos, input])
    setInput("")
  }

  return (
    <div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={addTodo}>추가</button>
      <ul>
        {todos.map((todo, i) => (
          <li key={i}>{todo}</li>
        ))}
      </ul>
    </div>
  )
}`,
  },
  {
    label: "로그인 폼",
    emoji: "🔐",
    code: `"use client"

import { useState } from "react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    alert("로그인 성공!")
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
      />
      <button type="submit" disabled={loading}>
        {loading ? "로그인 중..." : "로그인"}
      </button>
    </form>
  )
}`,
  },
  {
    label: "서버 컴포넌트",
    emoji: "🖥️",
    code: `import { Suspense } from "react"

async function UserInfo() {
  const res = await fetch("https://jsonplaceholder.typicode.com/users/1")
  const user = await res.json()

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}

export default function Page() {
  return (
    <main>
      <h1>서버 컴포넌트 예제</h1>
      <Suspense fallback={<p>로딩 중...</p>}>
        <UserInfo />
      </Suspense>
    </main>
  )
}`,
  },
];

interface ExampleButtonsProps {
  onSelect: (code: string) => void;
}

export function ExampleButtons({ onSelect }: ExampleButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-xs text-gray-500 w-full">예제 코드 불러오기:</span>
      {EXAMPLES.map((ex) => (
        <button
          key={ex.label}
          type="button"
          onClick={() => onSelect(ex.code)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-all"
        >
          <span>{ex.emoji}</span>
          <span>{ex.label}</span>
        </button>
      ))}
    </div>
  );
}
