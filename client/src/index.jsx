import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import async from 'async';

import Landing from './components/landing.jsx';
import Loading from './components/loading.jsx';
import Analytics from './components/analytics.jsx';
import AboutInfo from './components/aboutInfo.jsx';
import FeedInfo from './components/feedInfo.jsx';
import styles from '../styles/landing.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      city: '',
      stage: 'landing',
      analytics: {},
      feed: 'about',
      topSearchedUsers: [],
    };
    this.handleClick = this.handleClick.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.backToLanding = this.backToLanding.bind(this);
    this.handleFeedAboutClick = this.handleFeedAboutClick.bind(this);
  }

  // Keeps track of the state of the feed card
  // Gets invoked when user clicks on either About or Feed tags in the feed card title
  handleFeedAboutClick(feedState) {
    this.setState ({
      feed: feedState
    });
  }

  // Brings all of the app's states back to default values
  backToLanding() {
    this.setState({
      username: '',
      stage: 'landing',
      analytics: {},
      feed: 'about'
    });
  }


  // Updates app's state of username on every change upon user input
  onInputChange(event) {
    this.setState({
      username: event.target.value
    });
  }

  // Handles the click event on the submit button
  // When invoked, changes stage to loading until ajax request is successfully
  // returned
  handleClick(event) {
    // To prevent default auto refresh of the page
    event.preventDefault();

    // If input is invalid, alert user of invalid input
    // and don't send an http request to the server
    if (this.state.username === '' ||
    this.state.username === undefined ||
    this.state.username === null || typeof
    this.state.username !== 'string' ||
    this.state.username.includes('<')) {
      alert('Your input is invalid');
    } else {
      // Set stage to loading once button is clicked
      this.setState({
        stage: 'loading'
      });

      // Get value from input field and store it in the passable object
      var postObject = {
        screenName: this.state.username
      };

      $.ajax({
        type: 'POST',
        url: '/name',
        data: JSON.stringify(postObject),
        contentType: 'application/json',
        success: (data) => {
          console.log('POST request: success');
          console.log(data, 'data');
          // Changes stage to analytics
          // and sets received information to app state
          this.setState({
            analytics: data,
            stage: 'analytics'
          });
        },
        error: (err) => {
          if (err.status >= 400) {
            alert('Oops! Something went wrong...');
          } else {
            alert('Your input might be invalid');
          }
          // If error occurs, brink app back to initial state
          this.backToLanding();
          console.log('POST request: error', err);
        }
      });
    }
  }

  // Sets the city state.
  onCityChange(event) {
    this.setState({
      city: event.target.value
    });
  }

  // Handles the click event on the handle click submit button
  // When invoked, changes stage to loading until ajax request is successfully
  // returned
  handleCityClick(event) {
    event.preventDefault();

    // If input is invalid, alert user of invalid input
    // and don't send an http request to the server
    if (this.state.city === '' ||
      this.state.city === undefined ||
      this.state.city === null || typeof
      this.state.city !== 'string' ||
      this.state.city.includes('<')) {
      alert('Your input is invalid');
    } else {
      // Set stage to loading once button is clicked
      this.setState({
        stage: 'loading'
      });
    }
    // variable to send to post request
    var postObject = {
      city: this.state.city
    };
    $.ajax({
      type: 'POST',
      url: '/city',
      data: JSON.stringify(postObject),
      contentType: 'application/json',
      success: (data) => {
        console.log('POST request: success');
        console.log(data, 'data');
        // Changes stage to analytics
        // and sets received information to app state
        this.setState({
          analytics: data,
          stage: 'analytics'
        });
      },
      error: (err) => {
        if (err.status >= 400) {
          alert('Oops! Something went wrong...');
        } else {
          alert('Your input might be invalid');
        }
        // If error occurs, brink app back to initial state
        this.backToLanding();
        console.log('POST request: error', err);
      }
    });
  }

  componentWillMount () {
    // update feed
    var topSearches = [];
    // Ajax request to retrieve list of all searched users
    $.ajax({
      type: 'GET',
      url: '/usersList',
      success: (data) => {
        console.log('GET request: success');
        // Find top 10 most popular searches (based on 'count' property)
        async.each(data, (user, callback) => {
          if (topSearches.length < 10) {
              topSearches.push(user.Handle);
          } else {
            if (user.count !== 0) {
              for (var i = 0; i < topSearches.length; i++) {
                if (user.count > topSearches[i].count) {
                  topSearches[i] = user.Handle;
                  break;
                }
              }
            }
          }
          callback()
        }, () => {
          this.setState({
            topSearchedUsers: topSearches
          }, () => { console.log(this.state.topSearchedUsers)});
        });
      },
      error: (err) => {
        console.log('POST request: error', err);
      }
    });
  }

  render() {

    // Conditional rendering based on stage of the app
    let element = '';
    let homeButton = '';
    if (this.state.stage === 'landing') {
      element = <Landing handleClick={this.handleClick} onInputChange={this.onInputChange} handleFeedAboutClick={this.handleFeedAboutClick} feed={this.state.feed} topTen={this.state.topSearchedUsers}
                handleCityChange={this.onCityChange} handleCityClick={this.handleCityClick} />;
    }

    if (this.state.stage === 'loading') {
      element = <Loading stage={this.state.stage}/>;
    }

    if (this.state.stage === 'analytics') {
      homeButton = <button id={styles.homeButton} onClick={this.backToLanding}>HOME</button>;
      element = <Analytics analytics={this.state.analytics}/>;
    }

    return (
      <div className={styles.render_element}>
        {homeButton}
        {element}
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
