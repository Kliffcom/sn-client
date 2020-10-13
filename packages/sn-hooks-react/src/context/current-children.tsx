import { ODataParams } from '@sensenet/client-core'
import { deepMerge, PathHelper } from '@sensenet/client-utils'
import { GenericContent } from '@sensenet/default-content-types'
import { Created } from '@sensenet/repository-events'
import React, { useContext, useEffect, useState } from 'react'
import { useRepository, useRepositoryEvents } from '../hooks'
import { CurrentContentContext } from './current-content'
import { LoadSettingsContext } from './load-settings'

/**
 * Context that will return with a list of a current content's children
 */
export const CurrentChildrenContext = React.createContext<GenericContent[]>([])
CurrentChildrenContext.displayName = 'CurrentChildrenContext'

export interface CurrentChildrenProviderProps {
  loadSettings?: ODataParams<GenericContent>
  alwaysRefresh?: boolean
}

/**
 * Provider component for the CurrentChildrenContext component
 * Loads the children of the current content.
 * Loads an ancestor list from the Repository. Has to be wrapped with a **CurrentContentContext** and a **RepositoryContext**
 */
export const CurrentChildrenProvider: React.FunctionComponent<CurrentChildrenProviderProps> = (props) => {
  const currentContent = useContext(CurrentContentContext)
  const [children, setChildren] = useState<GenericContent[]>([])

  const alwaysRefresh = props.alwaysRefresh || currentContent.Type === 'SmartFolder'

  const [reloadToken, setReloadToken] = useState(1)
  const repo = useRepository()
  const eventHub = useRepositoryEvents()
  const loadSettings = useContext(LoadSettingsContext)

  const requestReload = () => setReloadToken(Math.random())
  const [error, setError] = useState<Error | undefined>()

  useEffect(() => {
    const ac = new AbortController()
    ;(async () => {
      if (currentContent.Path) {
        try {
          const childrenResult = await repo.loadCollection<GenericContent>({
            path: currentContent.Path,
            requestInit: { signal: ac.signal },
            oDataOptions: deepMerge(loadSettings.loadChildrenSettings, props.loadSettings),
          })
          setChildren(childrenResult.d.results)
        } catch (err) {
          if (!ac.signal.aborted) {
            setError(err)
          }
        }
      }
    })()
    return () => ac.abort()
  }, [currentContent.Path, loadSettings.loadChildrenSettings, props.loadSettings, repo, reloadToken])

  useEffect(() => {
    const handleCreate = (c: Created) => {
      if (alwaysRefresh || (c.content as GenericContent).ParentId === currentContent.Id) {
        return requestReload()
      }
      if (PathHelper.isAncestorOf(currentContent.Path, c.content.Path)) {
        requestReload()
      }
    }

    const subscriptions = [
      eventHub.onCustomActionExecuted.subscribe((event) => {
        if (event.actionOptions.method !== 'GET') {
          switch (event.actionOptions.name) {
            case 'DeleteBatch':
            case 'MoveBatch':
            case 'CopyBatch':
              return
            case 'Restore':
              if (
                alwaysRefresh ||
                PathHelper.getParentPath(event.actionOptions.idOrPath) === PathHelper.trimSlashes(currentContent.Path)
              ) {
                return requestReload()
              }
              break
            default:
              requestReload()
          }
        }
      }),
      eventHub.onContentCreated.subscribe(handleCreate),
      eventHub.onContentCopied.subscribe(handleCreate),
      eventHub.onContentMoved.subscribe((d) => {
        if (
          alwaysRefresh ||
          PathHelper.isAncestorOf(currentContent.Path, d.content.Path) ||
          PathHelper.getParentPath(d.content.OriginalPath) === PathHelper.trimSlashes(currentContent.Path)
        ) {
          requestReload()
        }
      }),
      eventHub.onContentModified.subscribe((mod) => {
        if (alwaysRefresh || mod.forceRefresh || children.some((c) => c.Id === mod.content.Id)) {
          requestReload()
        }
      }),

      eventHub.onUploadFinished.subscribe((data) => {
        if (alwaysRefresh || PathHelper.isAncestorOf(currentContent.Path, data.Url)) {
          requestReload()
        }
      }),
      eventHub.onContentDeleted.subscribe((d) => {
        if (
          alwaysRefresh ||
          PathHelper.getParentPath(d.contentData.Path) === PathHelper.trimSlashes(currentContent.Path)
        ) {
          requestReload()
        }
      }),
      eventHub.onBatchDelete.subscribe((deletedDatas) => {
        const current = deletedDatas.contentDatas.find(
          (contentData) => PathHelper.getParentPath(contentData.Path) === PathHelper.trimSlashes(currentContent.Path),
        )

        if (alwaysRefresh || current) {
          requestReload()
        }
      }),
    ]

    return () => subscriptions.forEach((s) => s.dispose())
  }, [
    currentContent,
    repo,
    children,
    eventHub.onCustomActionExecuted,
    eventHub.onContentCreated,
    eventHub.onContentCopied,
    eventHub.onContentMoved,
    eventHub.onContentModified,
    eventHub.onContentDeleted,
    eventHub.onUploadFinished,
    eventHub.onBatchDelete,
    alwaysRefresh,
  ])

  if (error) {
    throw error
  }

  return <CurrentChildrenContext.Provider value={children}>{props.children}</CurrentChildrenContext.Provider>
}
