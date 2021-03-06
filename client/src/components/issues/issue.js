import React, { Component } from 'react';
import {connect} from 'react-redux'
import {HashLink} from 'react-router-hash-link';
import {isEmpty, map} from 'lodash'
import {showTitle} from '../../redux/actions/ui'
import {formatDate} from '../../types/date'
import {requestReadIssue} from '../../redux/actions/issues'
import {getIssueByVolume} from '../../redux/selectors/issues'
import {
  getJudgesByIssueVolume,
  getContributorsByIssueVolume,
} from '../../redux/selectors/poets'
import {getPoemsByIssueVolume} from '../../redux/selectors/poems'
import {Poem} from '../poems/poem'


const mapStateToProps = (state, ownProps) => {
  // either get id from it being passed into the component directly
  // as a prop or get it from the url path params
  const volume = ownProps.volume || ownProps.match.params.volume
  
  return {
    volume,
    issue: getIssueByVolume(volume, state),
    judges: getJudgesByIssueVolume(volume, state),
    contributors: getContributorsByIssueVolume(volume, state),
    poems: getPoemsByIssueVolume(volume, state),
  }
}

const actions = {
  fetchIssue: requestReadIssue,
  showTitle,
}

// Issue represents the a single issue view including different modes
// such as table of contents, poems, and additional information (e.g.
// committee of judges and contributors)
export class issue extends Component {
  componentDidMount() {
    const {fetchIssue, issue, volume} = this.props

    // fetch this issue!
    if (isEmpty(issue)) {
      fetchIssue(volume) 
    }
  }
  
  render() {
    const {
      issue,
      poems,
      ShowTitle,
    } = this.props
    
    return (
      <div className='main'>
        <div className='issue-page-container'>
          <TOC issue={issue} poems={poems} showTitle={ShowTitle}/>
          <div className='issue-poems-container'>
            {
              map(
                this.props.poems,
                (i, idx) => <Poem poem={i} elemId={mkHashLinkId(i)} key={idx}/>,
                [],
              )
            }
          </div>
        </div>
      </div>
    )
  }
}

export const Issue = connect(mapStateToProps, actions)(issue)

const mkHashLinkId = poem =>
      (`${poem.author.name}-${poem.title}`.replace(/\s+/g, '-').toLowerCase())

class TOC extends Component {
  render() {
    const {
      title,
      date,
      description,
      volume,
    } = this.props.issue
    
    return (
      <div className='issue-toc'>
        <div className='issue-toc-header'>
          <span className='issue-toc-title'>{title}</span>
          <span className='issue-toc-subheader'>
            <span className='issue-toc-volume-item'>{`Vol. ${volume}`}</span>
            <span className='issue-toc-date-item'>{formatDate(date)}</span>
          </span>
          <div className='issue-toc-description-container'>
            <div className='issue-toc-description'>
              {description}
            </div>
          </div>
        </div>
        <div className='issue-toc-poems-container'>
          <div className='issue-toc-poems-header'>selected works</div>
          <div className='issue-toc-poems'>
            {
              map(
                this.props.poems,
                (poem, idx) => (
                  <HashLink to={`#${mkHashLinkId(poem)}`} className='text-link' key={idx}>
                    <div className='issue-toc-poem'>
                      <span className='issue-toc-poem-title'>{poem.title}</span>
                      <span className='issue-toc-poem-author'>{poem.author.name}</span>
                    </div>
                  </HashLink>
                ),
                [],
              )
          }
          </div>
        </div>
      </div>
    )
  }
}
