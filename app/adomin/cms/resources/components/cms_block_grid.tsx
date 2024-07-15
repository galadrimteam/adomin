import { CmsPage, GridLayout } from '#adomin/cms/utils/cms.types'
import { Html, PropsWithChildren } from '@kitajs/html'

export const BLOCK_ID_PREFIX = 'cms-'

const getGridTemplateAreas = (gridLayout: string[][]) => {
  const transformedGridLayout = gridLayout.map((line) =>
    line.map((gridIdentifier) => BLOCK_ID_PREFIX + gridIdentifier)
  )
  const areas = transformedGridLayout.map((line) => `"${line.join(' ')}"`).join('\n')

  return areas
}

const getGridTemplateColumns = (areas: string) => {
  const firstLine = areas.trim().split('\n')[0]
  const columns = firstLine
    .split(' ')
    .map(() => '1fr')
    .join(' ')

  return columns
}

export const getGridCss = (gridLayout: GridLayout, containerId: string) => {
  const sm = getGridTemplateAreas(gridLayout.sm)
  const smColumns = getGridTemplateColumns(sm)

  // fallback cascade
  gridLayout.medium = gridLayout.medium ?? gridLayout.sm
  gridLayout.large = gridLayout.large ?? gridLayout.medium
  gridLayout.xl = gridLayout.xl ?? gridLayout.large

  const medium = getGridTemplateAreas(gridLayout.medium)
  const mediumColumns = getGridTemplateColumns(medium)
  const large = getGridTemplateAreas(gridLayout.large)
  const largeColumns = getGridTemplateColumns(large)
  const xl = getGridTemplateAreas(gridLayout.xl)
  const xlColumns = getGridTemplateColumns(xl)

  const css = `
    #${containerId} {
      grid-template-areas: ${sm};
      grid-template-columns: ${smColumns};
      display: grid;
    }
    @media (min-width: 640px) {
      #${containerId} {
        grid-template-areas: ${medium};
        grid-template-columns: ${mediumColumns};
      }
    }
    @media (min-width: 1024px) {
      #${containerId} {
        grid-template-areas: ${large};
        grid-template-columns: ${largeColumns};
      }
    }
    @media (min-width: 1440px) {
      #${containerId} {
        grid-template-areas: ${xl};
        grid-template-columns: ${xlColumns};
      }
    }
    `

  return css
}

type CmsBlocGridProps = PropsWithChildren<{ cmsPage: CmsPage }>

export const CmsBlockGrid = ({ children, cmsPage }: CmsBlocGridProps) => {
  const gridId = 'cms-block-grid'
  const css = getGridCss(cmsPage.config.gridLayout, gridId)

  return (
    <>
      <style>{css}</style>
      <div id={gridId}>{children}</div>
    </>
  )
}
