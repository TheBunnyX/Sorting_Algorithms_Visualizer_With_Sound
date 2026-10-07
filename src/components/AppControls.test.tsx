import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App'
import SortStage from './SortStage'

describe('Sort With Sound controls', () => {
  it('accepts a seed and regenerates the array on demand', async () => {
    const user = userEvent.setup()
    render(<App />)
    const seed = screen.getByRole('textbox', { name: /seed/i })
    await user.clear(seed)
    await user.type(seed, 'demo-42')
    await user.click(screen.getByRole('button', { name: /generate from seed/i }))
    expect(seed).toHaveValue('demo-42')
    expect(screen.getByRole('status', { name: /ready/i })).toBeInTheDocument()
    expect(window.location.search).toContain('s=demo-42')
  })

  it('offers all ten sorting algorithms', () => {
    render(<App />)
    expect(within(screen.getByRole('combobox', { name: 'Algorithm' })).getAllByRole('option')).toHaveLength(10)
  })

  it('renders proportional bars with non-color state text', () => {
    render(<SortStage values={[20, 80, 40]} active={[1]} sorted={[0]} pivot={1} completionIndices={[0]} algorithm="quick" status="completing" comparisons={2} swaps={1} />)
    expect(screen.getAllByTitle(/Value/)).toHaveLength(3)
    expect(screen.getByLabelText(/value 80, active, pivot/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/value 20.*complete/i)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /quick sort completing/i })).toBeInTheDocument()
    expect(screen.getByText(/green pass \/ ascending/i)).toBeInTheDocument()
  })

  it('shows the working range and dims the bars outside it', () => {
    render(<SortStage values={[20, 80, 40, 60]} active={[1, 2]} sorted={[]} range={[1, 2]} algorithm="merge" status="running" comparisons={1} swaps={0} />)
    expect(screen.getByText('RANGE 01–02')).toBeInTheDocument()
    expect(screen.getByTitle('Value 20')).toHaveClass('bar-outside')
    expect(screen.getByTitle('Value 80')).not.toHaveClass('bar-outside')
  })

  it('starts, pauses, resumes and resets a sorting session', async () => {
    const user = userEvent.setup()
    render(<App />)

    const start = screen.getByRole('button', { name: /start sorting/i })
    await user.click(start)
    expect(screen.getByRole('status', { name: /running/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /pause sorting/i }))
    expect(screen.getByRole('status', { name: /paused/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /resume sorting/i }))
    expect(screen.getByRole('status', { name: /running/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /reset data/i }))
    expect(screen.getByRole('status', { name: /ready/i })).toBeInTheDocument()
  })

  it('does not create a second run when start is clicked twice', async () => {
    const user = userEvent.setup()
    render(<App />)
    const start = screen.getByRole('button', { name: /start sorting/i })
    await user.click(start)
    await act(async () => { await user.click(screen.getByRole('button', { name: /pause sorting/i })) })
    expect(screen.getByRole('status', { name: /paused/i })).toBeInTheDocument()
  })

  it('steps forward and back through the timeline', async () => {
    const user = userEvent.setup()
    render(<App />)
    const timeline = screen.getByRole('slider', { name: /timeline/i })
    expect(screen.getByRole('button', { name: /step back/i })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /step forward/i }))
    expect(timeline).toHaveValue('1')
    expect(screen.getByRole('status', { name: /paused/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /step back/i }))
    expect(timeline).toHaveValue('0')
    expect(screen.getByRole('status', { name: /ready/i })).toBeInTheDocument()
  })

  it('toggles playback with the space bar', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.keyboard(' ')
    expect(screen.getByRole('status', { name: /running/i })).toBeInTheDocument()
    await user.keyboard(' ')
    expect(screen.getByRole('status', { name: /paused/i })).toBeInTheDocument()
  })

  it('draws a fresh seed for new random data', async () => {
    const user = userEvent.setup()
    render(<App />)
    const seed = screen.getByRole('textbox', { name: /seed/i })
    const before = (seed as HTMLInputElement).value
    await user.click(screen.getByRole('button', { name: /new random data/i }))
    expect(seed).not.toHaveValue(before)
  })

  it('races a second algorithm on the same data', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.selectOptions(screen.getByRole('combobox', { name: /race against/i }), 'merge')
    expect(screen.getAllByRole('img')).toHaveLength(2)
    expect(screen.getByText('COMPARISONS A / B')).toBeInTheDocument()
    await user.selectOptions(screen.getByRole('combobox', { name: /race against/i }), '')
    expect(screen.getAllByRole('img')).toHaveLength(1)
  })
})
