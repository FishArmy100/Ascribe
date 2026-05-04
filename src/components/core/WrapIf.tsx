import React from "react"

// Checks if a component has any required props (beyond children)
type HasRequiredProps<T extends React.ElementType> =
    Omit<React.ComponentPropsWithoutRef<T>, "children"> extends Record<string, never>
        ? false
        : object extends Omit<React.ComponentPropsWithoutRef<T>, "children">
            ? false
            : true

// Makes `props` required if the wrapper has required props, optional otherwise
export type WrapIfProps<T extends React.ElementType> = {
    cond: boolean,
    wrapper: T,
    children: React.ReactNode,
} & (HasRequiredProps<T> extends true
  ? { props: Omit<React.ComponentPropsWithoutRef<T>, "children"> }
  : { props?: Omit<React.ComponentPropsWithoutRef<T>, "children"> })

function renderWrapper(
    Wrapper: React.ElementType,
    props: Record<string, unknown> | undefined,
    children: React.ReactNode
): React.ReactElement {
    return <Wrapper {...props}>{children}</Wrapper>
}

export default function WrapIf<T extends React.ElementType>({
    cond,
    wrapper,
    props,
    children
}: WrapIfProps<T>): React.ReactElement {
    return cond
        ? renderWrapper(wrapper, props as Record<string, unknown>, children)
        : <>{children}</>;
}