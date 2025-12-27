"use client";
import { useRef, useState, ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './TiltedCard.css';

const springValues = {
    damping: 30,
    stiffness: 100,
    mass: 2
};

interface TiltedCardProps {
    children: ReactNode;
    containerHeight?: string;
    containerWidth?: string;
    scaleOnHover?: number;
    rotateAmplitude?: number;
    showMobileWarning?: boolean;
    showTooltip?: boolean;
    captionText?: string;
    className?: string;
}

export default function TiltedCard({
    children,
    containerHeight = '100%',
    containerWidth = '100%',
    scaleOnHover = 1.05,
    rotateAmplitude = 8,
    showMobileWarning = false,
    showTooltip = false,
    captionText = '',
    className = ''
}: TiltedCardProps) {
    const ref = useRef<HTMLElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateXValue = useMotionValue(0);
    const rotateYValue = useMotionValue(0);
    const rotateX = useSpring(rotateXValue, springValues);
    const rotateY = useSpring(rotateYValue, springValues);
    const scale = useSpring(1, springValues);
    const opacity = useSpring(0);
    const rotateFigcaption = useSpring(0, {
        stiffness: 350,
        damping: 30,
        mass: 1
    });

    const [lastY, setLastY] = useState(0);

    function handleMouse(e: React.MouseEvent) {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left - rect.width / 2;
        const offsetY = e.clientY - rect.top - rect.height / 2;

        const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
        const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

        rotateXValue.set(rotationX);
        rotateYValue.set(rotationY);

        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);

        const velocityY = offsetY - lastY;
        rotateFigcaption.set(-velocityY * 0.6);
        setLastY(offsetY);
    }

    function handleMouseEnter() {
        scale.set(scaleOnHover);
        opacity.set(1);
    }

    function handleMouseLeave() {
        opacity.set(0);
        scale.set(1);
        rotateXValue.set(0);
        rotateYValue.set(0);
        rotateFigcaption.set(0);
    }

    return (
        <figure
            ref={ref}
            className="tilted-card-figure"
            style={{
                height: containerHeight,
                width: containerWidth
            }}
            onMouseMove={handleMouse}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {showMobileWarning && (
                <div className="tilted-card-mobile-alert">This effect is not optimized for mobile. Check on desktop.</div>
            )}

            <motion.div
                className="tilted-card-inner"
                style={{
                    rotateX,
                    rotateY,
                    scale
                }}
            >
                <div className={`tilted-card-content ${className}`}>
                    {children}
                </div>
            </motion.div>

            {showTooltip && captionText && (
                <motion.figcaption
                    className="tilted-card-caption"
                    style={{
                        x,
                        y,
                        opacity,
                        rotate: rotateFigcaption
                    }}
                >
                    {captionText}
                </motion.figcaption>
            )}
        </figure>
    );
}
