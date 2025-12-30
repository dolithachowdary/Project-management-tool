import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Loader = ({ fullScreen = true }) => {
    const containerRef = useRef(null);
    const dotsRef = useRef([]);

    useEffect(() => {
        // GSAP Animation
        const dots = dotsRef.current;

        // Reset any existing animations
        gsap.killTweensOf(dots);

        const tl = gsap.timeline({ repeat: -1, yoyo: true });

        tl.to(dots, {
            y: -20,
            stagger: 0.1,
            duration: 0.5,
            ease: "power2.out"
        });

        return () => {
            tl.kill();
        };
    }, []);

    const styles = {
        container: fullScreen ? {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slight transparency or solid white per requirements
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
        } : {
            width: '100%',
            height: '100%',
            minHeight: '200px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        dot: {
            width: 15,
            height: 15,
            borderRadius: '50%',
            backgroundColor: '#C62828', // Red
            margin: '0 5px',
        }
    };

    return (
        <div ref={containerRef} style={styles.container}>
            {[0, 1, 2].map(i => (
                <div
                    key={i}
                    ref={el => dotsRef.current[i] = el}
                    style={styles.dot}
                />
            ))}
        </div>
    );
};

export default Loader;
