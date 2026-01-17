'use client'

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useLoading from '@/hooks/useLoading';

export const AnimationType = {
    Spin: 'spin',
    FadeInOut: 'fadeInOut',
    None: 'none',
} as const;

export type AnimationType = (typeof AnimationType)[keyof typeof AnimationType];

const LoadingAnimationWrapper: React.FC<{ scale?: number, animationType?: AnimationType, animationDuration?: number, children: React.ReactNode, style?: React.CSSProperties, className?: string, id?: string, prefix?: string }> = ({ scale = 1, animationType = AnimationType.Spin, animationDuration, children, style, className, id, prefix }) => {
    const animationName = animationType;
    const defaultDuration = animationType === AnimationType.Spin ? 1 : animationType === AnimationType.FadeInOut ? 2 : 0;
    const duration = animationDuration || defaultDuration;
    const animationTiming = animationType === AnimationType.Spin ? 'linear' : animationType === AnimationType.FadeInOut ? 'ease-in-out' : 'linear';
    const animation = animationType === AnimationType.None ? 'none' : `${prefix}-${animationName} ${duration}s ${animationTiming} infinite`;
    return <div style={{ animation, ...(scale !== 1 ? { zoom: scale } : {}), ...style }} className={className} id={id} children={children} />
};

export const LoadingCircle: React.FC = (props) => (
    <div id="loading-circle" style={{ width: '90px', height: '90px', border: '15px solid #f3f3f3', borderTop: '15px solid #009b4bff', borderRadius: '50%', boxSizing: 'border-box' }} {...props} />
);

export const LoadingPleaseWait: React.FC = (props) => (
    <div style={{ padding: '20px', fontSize: '25px', color: '#333', fontFamily: 'system-ui, sans-serif' }} {...props} children={"Please wait..."} />
);

export default function LoadingRenderer({
    loadingComponent,
    loadingComponentScale = 1,
    animationType = AnimationType.Spin,
    animationDuration,
    wrapperStyle,
    wrapperClassName,
    wrapperId,
    animationWrapperStyle,
    animationWrapperClassName,
    animationWrapperId
}: {
    loadingComponent?: React.ComponentType | React.ReactElement;
    loadingComponentScale?: number;
    animationType?: AnimationType;
    animationDuration?: number;
    wrapperStyle?: React.CSSProperties;
    wrapperClassName?: string;
    wrapperId?: string;
    animationWrapperStyle?: React.CSSProperties;
    animationWrapperClassName?: string;
    animationWrapperId?: string;
}) {
    loadingComponent = loadingComponent ? loadingComponent : animationType === AnimationType.Spin ? LoadingCircle : LoadingPleaseWait;
    const randomId = useRef(Math.random().toString(36).substring(2, 6).replace(/[0-9]/g, ''));
    const { isLoading } = useLoading();
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isLoading) {
            dialogRef.current?.showModal();
            document.body.setAttribute('inert', '');
        } else {
            dialogRef.current?.close();
            document.body.removeAttribute('inert');
        }
    }, [isLoading]);

    const wrapperIdFinal = wrapperId || 'loading-wrapper-' + randomId.current;

    return !isLoading ? null : createPortal(
        <>
            <style>{`
                        dialog#${wrapperIdFinal}[open] {
                            display: flex !important;
                            justify-content: center;
                            align-items: center;
                            width: 100vw;
                            height: 100vh;
                            max-width: 100%;
                            max-height: 100%;
                        }
                        @keyframes ${randomId.current}-spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        @keyframes ${randomId.current}-fadeInOut {
                            0%, 100% { opacity: 0.2; }
                            50% { opacity: 1; }
                        }
                        body:has(dialog#${wrapperIdFinal}[open]) {
                            overflow: hidden;
                        }
                        body {
                            scrollbar-gutter: stable;
                        }
                    `}
            </style>
            <dialog
                ref={dialogRef}
                style={{
                    border: 'none',
                    padding: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(2px)',
                    ...wrapperStyle,
                }}
                className={wrapperClassName}
                id={wrapperIdFinal}
            >
                <LoadingAnimationWrapper scale={loadingComponentScale} animationType={animationType} animationDuration={animationDuration} style={animationWrapperStyle} className={animationWrapperClassName} id={animationWrapperId} prefix={randomId.current}>
                    {React.isValidElement(loadingComponent)
                        ? loadingComponent
                        : React.createElement(loadingComponent as React.ComponentType)}
                </LoadingAnimationWrapper>
            </dialog>
        </>
        ,
        document.body
    );
}
