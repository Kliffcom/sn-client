import { Settings } from '@sensenet/default-content-types'
import { useRepository } from '@sensenet/hooks-react'
import { createStyles, makeStyles, Theme } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import clsx from 'clsx'
import React, { useContext } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { ResponsivePersonalSettings } from '../../context'
import { useLocalization } from '../../hooks'
import { getPrimaryActionUrl } from '../../services'

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    card: {
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'column',
      width: 339,
      height: 374,
      margin: '0.5em',
      marginRight: '49px',
      marginBottom: '49px',
      backgroundColor: theme.palette.type === 'light' ? '#F8F8F8' : 'rgba(255,255,255,0.11)',
      border: theme.palette.type === 'light' ? '1px solid #D6D6D6' : 'none',
      boxShadow: theme.palette.type === 'light' ? '4px 4px 8px #0000001A' : 'none',
    },
    button: {
      width: '110px',
      height: '36px',
      border: clsx('1px solid', theme.palette.primary.main),
      margin: '7px',
    },
  })
})

export const SETUP_DOCS_URL = 'https://docs.sensenet.com/concepts/basics/07-settings'

export const createAnchorFromName = (displayName: string) => `#${displayName.replace('.', '-').toLocaleLowerCase()}`

type ContentCardProps = {
  settings: Settings
  onContextMenu: (ev: React.MouseEvent) => void
}

export const ContentCard = ({ settings, onContextMenu }: ContentCardProps) => {
  const localization = useLocalization().settings
  const repository = useRepository()
  const uiSettings = useContext(ResponsivePersonalSettings)
  const history = useHistory()
  const classes = useStyles()

  return (
    <Card
      onContextMenu={(ev) => {
        ev.preventDefault()
        onContextMenu(ev)
      }}
      className={classes.card}
      data-test="content-card">
      <CardContent>
        <Typography variant="h5" gutterBottom={true}>
          {settings.DisplayName || settings.Name}
        </Typography>
        <Typography
          color="textSecondary"
          style={{ wordWrap: 'break-word' }}
          dangerouslySetInnerHTML={{ __html: settings.Description || '' }}
        />
      </CardContent>
      <CardActions style={{ justifyContent: 'flex-end' }}>
        <Link
          to={getPrimaryActionUrl({ content: settings, repository, uiSettings, location: history.location })}
          style={{ textDecoration: 'none' }}>
          <Button
            aria-label={localization.edit}
            size="small"
            className={classes.button}
            style={{ marginRight: '35px' }}
            data-test="content-card-edit-button">
            {localization.edit}
          </Button>
        </Link>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`${SETUP_DOCS_URL}${createAnchorFromName(settings.DisplayName ? settings.DisplayName : '')}`}
          style={{ textDecoration: 'none' }}>
          <Button
            aria-label={localization.learnMore}
            size="small"
            className={classes.button}
            data-test="content-card-learnmore-button">
            {localization.learnMore}
          </Button>
        </a>
      </CardActions>
    </Card>
  )
}
