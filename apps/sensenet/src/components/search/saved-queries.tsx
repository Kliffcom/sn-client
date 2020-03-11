import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Typography from '@material-ui/core/Typography'

import { ConstantContent } from '@sensenet/client-core'
import { debounce } from '@sensenet/client-utils'
import { Query } from '@sensenet/default-content-types'
import React, { useContext, useEffect, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import {
  CurrentAncestorsContext,
  CurrentChildrenContext,
  CurrentContentContext,
  LoadSettingsContext,
  useInjector,
  useRepository,
  useRepositoryEvents,
} from '@sensenet/hooks-react'
import clsx from 'clsx'
import { useLocalization } from '../../hooks'
import { ContentList } from '../content-list/content-list'
import { useGlobalStyles } from '../../globalStyles'
import { encodeQueryData } from '.'

const Search: React.FunctionComponent<RouteComponentProps> = props => {
  const repo = useRepository()
  const localization = useLocalization().search
  const injector = useInjector()

  const [onlyPublic, setOnlyPublic] = useState(false)
  const [queries, setQueries] = useState<Query[]>([])

  const [reloadToken, setReloadToken] = useState(Math.random())
  const [requestReload] = useState(() => debounce(() => setReloadToken(Math.random()), 250))
  const loadSettingsContext = useContext(LoadSettingsContext)

  const eventHub = useRepositoryEvents()
  const globalClasses = useGlobalStyles()

  useEffect(() => {
    const subscriptions = [
      eventHub.onContentModified.subscribe(() => requestReload()),
      eventHub.onContentCopied.subscribe(() => requestReload()),
      eventHub.onContentCreated.subscribe(() => requestReload()),
      eventHub.onContentDeleted.subscribe(() => requestReload()),
    ]
    return () => subscriptions.forEach(s => s.dispose())
  }, [
    eventHub.onContentCopied,
    eventHub.onContentCreated,
    eventHub.onContentDeleted,
    eventHub.onContentModified,
    injector,
    repo,
    requestReload,
  ])

  useEffect(() => {
    repo
      .executeAction<undefined, { d: { results: Query[] } }>({
        idOrPath: '/Root/Content',
        name: 'GetQueries',
        method: 'GET',
        oDataOptions: {
          ...loadSettingsContext.loadChildrenSettings,
          select: ['Query', 'Icon'],
          onlyPublic,
        } as any,
        body: undefined,
      })
      .then(result => setQueries(result.d.results))
  }, [reloadToken, loadSettingsContext.loadChildrenSettings, repo, onlyPublic])
  return (
    <div style={{ padding: '0 15px', overflow: 'hidden', height: '100%' }}>
      <>
        <div className={clsx(globalClasses.contentTitle, globalClasses.centeredVertical)}>
          <span style={{ fontSize: '20px' }}>{localization.savedQueries}</span>
        </div>
        <FormControlLabel
          label={localization.onlyPublic}
          control={
            <Checkbox
              onChange={ev => {
                setOnlyPublic(ev.target.checked)
                requestReload()
              }}
            />
          }
        />
      </>
      <>
        {queries.length > 0 ? (
          <CurrentContentContext.Provider value={ConstantContent.PORTAL_ROOT}>
            <CurrentChildrenContext.Provider value={queries}>
              <CurrentAncestorsContext.Provider value={[]}>
                <ContentList
                  style={{
                    height: 'calc(100% - 107px)',
                    overflow: 'auto',
                  }}
                  enableBreadcrumbs={false}
                  parentIdOrPath={0}
                  onParentChange={() => {
                    // ignore, only queries will be listed
                  }}
                  onActivateItem={p => {
                    props.history.push(
                      `/${btoa(repo.configuration.repositoryUrl)}/search/${encodeQueryData({
                        term: (p as Query).Query || '',
                      })}`,
                    )
                  }}
                />
              </CurrentAncestorsContext.Provider>
            </CurrentChildrenContext.Provider>
          </CurrentContentContext.Provider>
        ) : (
          <Typography variant="subtitle1" style={{ marginTop: '3em' }}>
            {localization.noSavedQuery}
          </Typography>
        )}
      </>
    </div>
  )
}

export default withRouter(Search)
