import { ListItemText, MenuItem } from '@material-ui/core'
import Select, { SelectProps } from '@material-ui/core/Select'
import { FieldSetting, GenericContent } from '@sensenet/default-content-types'
import { Query } from '@sensenet/query'
import React = require('react')

/**
 * Props object for the SelectFieldP Component
 */
export interface SelectFieldProps<T> extends SelectProps {
    /**
     * Name of the field
     */
    fieldName: string

    /**
     *  The preset values shown in the select list
     */
    presets: Array<{ text: string, value: Query<T> }>

    /**
     * Callback that will triggered when the query changes
     */
    onQueryChange: (key: string, query: Query<T>) => void
    /**
     * Field settings for setting labels, placeholders and hint texts
     */
    fieldSetting?: Partial<FieldSetting>
    /**
     * Additional key that can be used if you have multiple controls for the same field
     */
    fieldKey?: string
}

/**
 * Component for searching simple text fragments in a specified field
 * @param props
 */
export class PresetField<T extends GenericContent = GenericContent> extends React.Component<SelectFieldProps<T>, { value: string }> {

    /**
     * Preset field state object
     */
    public state = { value: '' }

    /**
     * renders the component
     */
    public render() {
        const { fieldName, fieldKey, fieldSetting, onQueryChange, presets, ...materialProps } = this.props
        return <Select
            value={this.state.value}
            onChange={(ev) => {
                const preset = this.props.presets.find((p) => p.text === ev.target.value.toString())
                if (preset) {
                    this.props.onQueryChange(this.props.fieldKey || this.props.fieldName, preset.value)
                    this.setState({ value: ev.target.value })
                }
            }}
            {...materialProps}
        >
            {this.props.presets.map((p) => {
                return <MenuItem value={p.text} key={p.text}>
                    <ListItemText >{p.text}</ListItemText>
                </MenuItem>

            })}
        </Select>
    }

}
