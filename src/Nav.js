import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from './store';

const Nav = ({ orders, products, path, cart, loggedIn, quantity, auth, logout })=> {
  const getClass = (_path)=> {
    return `nav-link${ path === _path ? ' active' : ''}`;
  }

  return (
    <ul style={{ marginBottom: '10px'}} className='nav nav-tabs'>
      <li className='nav-item'>
        <Link className={ getClass('/')} to='/'>Home</Link>
      </li>
      {
        loggedIn && (
            <Fragment>
              <li className='nav-item'>
                <Link  className={ getClass('/cart')} to='/cart'>Cart ({ quantity })</Link></li>
              <li className='nav-item'>
                <Link to='/orders' className={ getClass('/orders')} >Orders ({ orders.length })</Link>
              </li>
          </Fragment>
        )
      }
      {
        loggedIn ? (
            <li>
              <button className='btn btn-primary' onClick={ logout }>Logout { auth.name }</button>
            </li>
            ): (
            <li className='nav-item'>
              <a href='/api/auth/github' className={ getClass('/login')} to='/login'>
                Login
              </a>
            </li>
        )
      }
    </ul>
  );
};

const mapStateToProps = ({ products, orders, auth })=> {
  const cart = orders.find(order => order.status === 'CART');
  let quantity = 0;
  if(cart){
    quantity = cart.lineItems.reduce((memo, lineItem)=> {
      memo += lineItem.quantity;
      return memo;
    }, 0);
  }
  return {
    auth,
    loggedIn: auth.id,
    products,
    orders : orders.filter(order => order.status === 'ORDER'),
    cart,
    quantity 
  };
};

const mapDispatchToProps = (dispatch)=> ({
  logout: ()=> dispatch(logout())
});
export default connect(mapStateToProps, mapDispatchToProps)(Nav);
