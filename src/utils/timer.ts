import { useRef, useState, useCallback, useEffect } from 'react'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerState {
	status: TimerStatus,
	elapsed: number,
	remaining: number,
	progress: number,
}

export interface UseTimerReturn extends TimerState {
	start: () => void,
	pause: () => void,
	reset: () => void,
	set_duration: (seconds: number) => void,
	duration: number,
}

export function use_timer(initial_duration: number): UseTimerReturn 
{
	const [duration, set_duration_state] = useState(initial_duration);
	const [elapsed, set_elapsed] = useState(0);
	const [status, set_status] = useState<TimerStatus>('idle');

	const raf_ref = useRef<number | null>(null);
	const last_ts_ref = useRef<number | null>(null);
	const elapsed_ref = useRef(0);
	const duration_ref = useRef(duration);
	const last_rendered_second_ref = useRef(-1);

	const status_ref = useRef<TimerStatus>('idle');

	useEffect(() => {
		status_ref.current = status;
	}, [status]);

	useEffect(() => { duration_ref.current = duration }, [duration])

	const tick = useCallback((ts: number) => {
		if (status_ref.current !== "running")
			return;
		
		if (last_ts_ref.current !== null) 
        {
			elapsed_ref.current = Math.min(
				duration_ref.current,
				elapsed_ref.current + (ts - last_ts_ref.current) / 1000
			)

			const new_second = Math.floor(elapsed_ref.current);
			if (new_second !== last_rendered_second_ref.current) {
				last_rendered_second_ref.current = new_second;
				set_elapsed(elapsed_ref.current);
			}
		}

		last_ts_ref.current = ts

		if (elapsed_ref.current >= duration_ref.current) 
        {
			set_status('completed');
			return;
		}

		raf_ref.current = requestAnimationFrame(tick);
	}, []);

	const start = useCallback(() => {
		set_status(prev => {
			if (prev === 'idle' || prev === 'paused') 
            {
				last_ts_ref.current = null;
				raf_ref.current = requestAnimationFrame(tick);
				return 'running';
			}

			return prev;
		})
	}, [tick]);

	const pause = useCallback(() => {
		console.log("pausing");
		set_status(prev => {
			if (prev === 'running') 
            {
				if (raf_ref.current) 
					cancelAnimationFrame(raf_ref.current);

				last_ts_ref.current = null;
				return 'paused';
			}
			return prev;
		})
	}, []);

	const reset = useCallback(() => {
		if (raf_ref.current) cancelAnimationFrame(raf_ref.current);
		elapsed_ref.current = 0;
		last_ts_ref.current = null;
		set_elapsed(0);
		set_status('idle');
	}, []);

	const set_duration = useCallback((seconds: number) => {
		if (raf_ref.current) 
			cancelAnimationFrame(raf_ref.current);

		elapsed_ref.current = 0;
		last_ts_ref.current = null;
		duration_ref.current = seconds
		set_duration_state(seconds);
		set_elapsed(0);
		set_status('idle');
	}, []);

	useEffect(() => {
		set_duration(initial_duration);
	}, [initial_duration]);

	useEffect(() => () => {
		if (raf_ref.current) cancelAnimationFrame(raf_ref.current);
	}, []);

	const remaining = Math.max(0, duration - elapsed);
	const progress = duration > 0 ? elapsed / duration : 0;

	return { 
		status, 
		elapsed, 
		remaining, 
		progress, 
		duration, 
		start, 
		pause, 
		reset, 
		set_duration 
	};
}