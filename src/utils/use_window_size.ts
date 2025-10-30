import { useState, useEffect } from "react";

export default function use_window_size(): { width: number, height: number }
{
    const [size, set_size] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handle_resize = () => {
            set_size({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener("resize", handle_resize);

        return () => window.removeEventListener("resize", handle_resize);
    }, []);

    return size;
}
