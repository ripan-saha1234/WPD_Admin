import { useContext } from "react";
import { Fragment } from "react";
import { globalContext } from "../context/context";
import { useNavigate } from "react-router-dom";
import "../css/breadcrums.css";


function Breadcrums() {
  const { breadcrums } = useContext(globalContext);
  const navigate = useNavigate();
  return (
    <div className="breadcrums-container">
      {
        breadcrums?.map((item, index) => (
          <Fragment key={index}>
            <span className={'breadcrums ' + (index === breadcrums.length - 1 ? 'breadcrums-active' : '')} onClick={() => navigate(item.link)}> {item.title} </span>
            {
              index !== breadcrums.length - 1 && <span className="breadcrums-divider"> / </span>
            }
          </Fragment>
        ))
      }
    </div>
  );
}

export default Breadcrums;