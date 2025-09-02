import { useEffect } from 'react';
import { useLoadingStore } from '../state/Store';

export const SceneReadySignal = () => {
    const setSceneReady = useLoadingStore((state) => state.setSceneReady);

    useEffect(() => {
        setSceneReady(true);

        return () => {
            setSceneReady(false);
        };
    }, [setSceneReady]);

    return null;
};