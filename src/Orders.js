import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

const Orders = ({ orders, productMap })=> {
  return (
    <div>
      <h1>Orders</h1>
      <div>
        {
          orders.map( order => {
            return (
              <div  className='card' key={ order.id }>
                <div className='card-body'>
              #{ order.id }
                  <ul className='list-group'>
                  {
                    order.lineItems.map( lineItem => {
                      if(!productMap[lineItem.productId]){
                        return null;
                      }
                      return (
                        <li className='list-group-item' key={ lineItem.productId} id={ lineItem.id }>
                          {

                            productMap[lineItem.productId].name

                          }
                          <span className='badge badge-primary' style={{ float: 'right'}}>{
                            lineItem.quantity
                          }
                          </span>
                        </li>
                      );
                    })
                  }
                  </ul>
                  <br />
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

const mapDispatchToProps = (dispatch)=> {
  return {
  };
};

const mapStateToProps = ({ products, orders })=> {
  return {
    productMap: products.reduce((memo, product)=> {
      memo[product.id] = product;
      return memo;
    }, {}),
    orders : orders.filter(order => order.status === 'ORDER')
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Orders);
