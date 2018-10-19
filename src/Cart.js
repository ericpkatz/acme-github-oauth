import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createOrder, addToCart, removeFromCart } from './store';

const Products = ({ products, cart, cartMap, addToCart, removeFromCart, createOrder })=> {
  if(!cart){
    return null;
  }
  return (
    <div>
      <h1>Products</h1>
      <div style={{ display: 'flex', justifyContent: 'space-around'}}>
        {
          products.map( product => {
            return (
              <div  style={{ width: '150px' }} className='card' key={ product.id }>
                <div className='card-body'>
                  { product.name }
                  <br />
                  {
                    cartMap[product.id] ? cartMap[product.id].quantity : '0'
                  }
              {' ordered' }
                  <br />
                  <button
                    className='btn btn-primary'
                    onClick={()=> addToCart(cart, product, cartMap[product.id])}>+</button>
                  { ' ' }
                  <button
                    disabled={!cartMap[product.id]}
                    className='btn btn-primary'
                    onClick={()=> removeFromCart(cart, cartMap[product.id])}>-</button>
                </div>
              </div>
            );
          })
        }
      </div>
      <button className='btn btn-primary' style={{ marginTop: '10px'}}onClick={ ()=> createOrder(cart) } disabled={ !cart.lineItems.length }>Create Order</button>
    </div>
  );
}

const mapDispatchToProps = (dispatch, { history })=> {
  return {
    createOrder: (cart)=> dispatch(createOrder(cart, history)),
    addToCart: (cart, product, lineItem)=> {
      return dispatch(addToCart( cart, product, lineItem ));
    },
    removeFromCart: (cart, lineItem)=> {
      return dispatch(removeFromCart( cart, lineItem ));
    }
  };
};

const mapStateToProps = ({ products, orders })=> {
  const cart = orders.find( order => order.status === 'CART');
  let cartMap = {};
  if(cart){
    cartMap = cart.lineItems.reduce( (memo, lineItem) => {
      memo[lineItem.productId] = lineItem;
      return memo;
    }, {})
  }

  return {
    products,
    cart,
    cartMap
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Products);
