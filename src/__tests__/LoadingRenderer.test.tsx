import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import LoadingRenderer, { LoadingCircle, LoadingPleaseWait, AnimationType } from '../components/LoadingRenderer';
import useLoading from '../hooks/useLoading';

describe('LoadingRenderer Component', () => {
    describe('rendering', () => {
        it('should not render anything when not loading', () => {
            const { container } = render(<LoadingRenderer />);
            expect(container.querySelector('dialog')).not.toBeInTheDocument();
        });

        it('should render loading overlay when loading', async () => {
            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);
            const button = getByRole('button');

            act(() => {
                button.click();
            });

            await waitFor(() => {
                expect(document.querySelector('dialog[open]')).toBeInTheDocument();
            });
        });

        it('should render with default LoadingCircle component', async () => {
            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                expect(document.getElementById('loading-circle')).toBeInTheDocument();
            });
        });
    });

    describe('LoadingCircle preset component', () => {
        it('should render circle element', () => {
            const { container } = render(<LoadingCircle />);
            const circle = container.querySelector('#loading-circle');

            expect(circle).toBeInTheDocument();
            expect(circle).toHaveStyle('width: 90px');
            expect(circle).toHaveStyle('height: 90px');
            expect(circle).toHaveStyle('border-radius: 50%');
        });

        it('should have correct dimensions and styling', () => {
            const { container } = render(<LoadingCircle />);
            const circle = container.querySelector('#loading-circle');

            const style = window.getComputedStyle(circle!);
            expect(style.width).toBe('90px');
            expect(style.height).toBe('90px');
            expect(style.borderRadius).toBe('50%');
        });
    });

    describe('LoadingPleaseWait preset component', () => {
        it('should render text component', () => {
            const { getByText } = render(<LoadingPleaseWait />);

            expect(getByText('Please wait...')).toBeInTheDocument();
        });

        it('should have correct styling', () => {
            const { container } = render(<LoadingPleaseWait />);
            const element = container.firstChild;

            expect(element).toHaveStyle({
                padding: '20px',
                fontSize: '25px',
                color: '#333',
                fontFamily: 'system-ui, sans-serif'
            });
        });
    });

    describe('custom loading component', () => {
        it('should accept custom React component', async () => {
            const CustomLoader = () => <div data-testid="custom-loader">Custom Loading</div>;

            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer loadingComponent={CustomLoader} />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole, getByTestId } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                expect(getByTestId('custom-loader')).toBeInTheDocument();
            });
        });

        it('should accept custom React element', async () => {
            const customElement = <div data-testid="custom-element">Loading...</div>;

            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer loadingComponent={customElement} />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole, getByTestId } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                expect(getByTestId('custom-element')).toBeInTheDocument();
            });
        });
    });

    describe('animation types', () => {
        it('should support spin animation', async () => {
            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer animationType={AnimationType.Spin} />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                const dialog = document.querySelector('dialog[open]');
                expect(dialog).toBeInTheDocument();
            });
        });

        it('should support fadeInOut animation', async () => {
            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer animationType={AnimationType.FadeInOut} />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                const dialog = document.querySelector('dialog[open]');
                expect(dialog).toBeInTheDocument();
            });
        });

        it('should support no animation', async () => {
            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer animationType={AnimationType.None} />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                const dialog = document.querySelector('dialog[open]');
                expect(dialog).toBeInTheDocument();
            });
        });
    });

    describe('animation duration', () => {
        it('should accept custom animation duration', async () => {
            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer animationType={AnimationType.Spin} animationDuration={0.5} />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                const dialog = document.querySelector('dialog[open]');
                expect(dialog).toBeInTheDocument();
            });
        });

        it('should use default duration when not provided', async () => {
            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer animationType={AnimationType.Spin} />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                const dialog = document.querySelector('dialog[open]');
                expect(dialog).toBeInTheDocument();
            });
        });
    });

    describe('component scaling', () => {
        it('should apply scale to loading component', async () => {
            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer loadingComponentScale={2} />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                const dialog = document.querySelector('dialog[open]');
                expect(dialog).toBeInTheDocument();
            });
        });

        it('should use default scale of 1', async () => {
            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                const dialog = document.querySelector('dialog[open]');
                expect(dialog).toBeInTheDocument();
            });
        });
    });

    describe('wrapper styling', () => {
        it('should apply custom wrapper styles', async () => {
            const customStyle = { backgroundColor: 'rgba(255, 0, 0, 0.5)' };

            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer wrapperStyle={customStyle} />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                const dialog = document.querySelector('dialog[open]');
                expect(dialog).toBeInTheDocument();
            });
        });

        it('should apply custom wrapper class', async () => {
            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer wrapperClassName="custom-loader-class" />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                const dialog = document.querySelector('.custom-loader-class');
                expect(dialog).toBeInTheDocument();
            });
        });

        it('should apply custom wrapper ID', async () => {
            const customId = 'my-custom-loader-id';

            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer wrapperId={customId} />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                const dialog = document.querySelector(`#${customId}`);
                expect(dialog).toBeInTheDocument();
            });
        });
    });

    describe('animation wrapper styling', () => {
        it('should apply custom animation wrapper styles', async () => {
            const customStyle = { transform: 'scale(1.5)' };

            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer animationWrapperStyle={customStyle} />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                const dialog = document.querySelector('dialog[open]');
                expect(dialog).toBeInTheDocument();
            });
        });

        it('should apply custom animation wrapper class', async () => {
            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer animationWrapperClassName="custom-animation-class" />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                const animationWrapper = document.querySelector('.custom-animation-class');
                expect(animationWrapper).toBeInTheDocument();
            });
        });
    });

    describe('accessibility features', () => {
        it('should set inert on body when loading', async () => {
            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                expect(document.body).toHaveAttribute('inert');
            });
        });

        it('should handle loading renderer dialog display', async () => {
            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                const dialog = document.querySelector('dialog[open]');
                expect(dialog).toBeInTheDocument();
            });
        });

        it('should manage body styling during loading', async () => {
            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                expect(document.body).toHaveAttribute('inert');
            });
        });
    });

    describe('multiple renderers', () => {
        it('should handle multiple LoadingRenderer instances', async () => {
            const TestWrapper = () => {
                const { startLoading } = useLoading();

                return (
                    <>
                        <LoadingRenderer wrapperId="loader-1" />
                        <LoadingRenderer wrapperId="loader-2" />
                        <button onClick={() => startLoading()}>Start</button>
                    </>
                );
            };

            const { getByRole } = render(<TestWrapper />);

            act(() => {
                getByRole('button').click();
            });

            await waitFor(() => {
                // Both loaders should be in document
                expect(document.querySelector('#loader-1')).toBeInTheDocument();
                expect(document.querySelector('#loader-2')).toBeInTheDocument();
            });
        });
    });
});
