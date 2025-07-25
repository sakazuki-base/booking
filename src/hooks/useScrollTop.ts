export const useScrollTop = () => {
    const scrollTop: () => void = () => window.scrollTo(0, 0);
    return { scrollTop }
}