'use client'
import { useEffect, useRef } from 'react'

const BarScanner = ({ onScan }) => {
    const buffer = useRef('')
    const lastKeyTime = useRef(Date.now())

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            // 1. Identify if the user is busy with UI elements
            const activeEl = document.activeElement;
            const isUserBusy = 
                activeEl.tagName === 'INPUT' || 
                activeEl.tagName === 'TEXTAREA' || 
                activeEl.tagName === 'SELECT' || 
                activeEl.closest('.dropdown-content') || // If using custom tailwind dropdowns
                activeEl.isContentEditable;

            // If user is typing in a search box or using a menu, do nothing
            if (isUserBusy) return;

            const currentTime = Date.now();
            const timeDiff = currentTime - lastKeyTime.current;
            lastKeyTime.current = currentTime;

            // 2. Handle the Barcode Logic
            if (e.key === 'Enter') {
                if (buffer.current.length > 2) {
                    onScan(buffer.current);
                }
                buffer.current = ''; // Reset buffer
            } else if (e.key.length === 1) {
                // Laser scanners are incredibly fast (< 30ms between keys)
                // If timeDiff is large, a human probably typed it, so we reset
                if (timeDiff > 50) {
                    buffer.current = e.key;
                } else {
                    buffer.current += e.key;
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [onScan]);

    // Return null so no invisible elements mess with your layout or clicks
    return null;
}

export default BarScanner;
