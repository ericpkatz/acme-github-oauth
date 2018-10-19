import React, { Component } from 'react';
import { connect } from 'react-redux';
import { login } from './store';

class Login extends Component{
  constructor(){
    super();
    this.state = {
      name: '',
      password: '',
      error: ''
    };
    this.onChange = this.onChange.bind(this);
    this.login = this.login.bind(this);
  }
  login(ev){
    ev.preventDefault();
    console.log(this.state);
    const { name, password } = this.state;
    const credentials = { name, password };
    this.props.login(credentials)
      .catch(ex => {
        this.setState({ error: 'Bad credentials'});
      });
  }
  onChange(ev){
    this.setState({[ev.target.name]: ev.target.value});
  }
  render(){
    const { name, password, error } = this.state;
    const { onChange, login } = this;
    return (
      <form className='jumbotron' onSubmit={ login }>
        <h2>Login</h2>
        <div className='form-group'>
          <input placeholder='name' className='form-control' name='name' value={ name } onChange={ onChange } />
        </div>
        <input type='password' placeholder='password' className='form-control' name='password' value={ password } onChange={ onChange } />
        <button style={{ marginTop: '10px'}} className='btn btn-primary'>Login</button>
        {
          error
        }
      </form>
    );
  }
}

const mapDispatchToProps = (dispatch, { history })=> ({
  login: (credentials)=> dispatch(login(credentials, history))
});

export default connect(null, mapDispatchToProps)(Login);
