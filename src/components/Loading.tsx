'use client';

import { useEffect } from "react";
import useLoading from "@/mainLogic";

export default function Loading({ isLoading = false }: { isLoading: boolean }) {
    const { startLoading, stopLoading } = useLoading();

    useEffect(() => {
        if (isLoading) {
            startLoading();
        } else {
            stopLoading();
        }
        return () => {
            if (isLoading) {
                stopLoading();
            }
        }
    }, [isLoading]);
    return null
}

