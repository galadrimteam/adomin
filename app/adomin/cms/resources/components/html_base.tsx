import { Html, PropsWithChildren } from '@kitajs/html'

type HtmlBaseProps = PropsWithChildren<{
  title: string
  bodyCss?: JSX.HtmlTag['style']
  iconSrc?: string
}>

export const HtmlBase = ({ children, title, bodyCss, iconSrc }: HtmlBaseProps) => (
  <>
    {'<!DOCTYPE html>'}
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        {iconSrc ? <link rel="shortcut icon" href={iconSrc} /> : null}
        {/* TODO add meta tags */}
      </head>
      <body style={bodyCss ?? {}}>{children}</body>
    </html>
  </>
)
