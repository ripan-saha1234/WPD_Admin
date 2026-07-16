import { useContext } from 'react';
import Breadcrums from '../../components/breadcrums';
import { globalContext } from '../../context/context';
import HeaderActions from './HeaderActions';

function LayoutHeader() {
  const { pageTitle, user, buttonList, subTitle } = useContext(globalContext);
  const { text, textColor, backgroundColor } = subTitle;

  return (
    <>
      <div className="common-layout-header">
        <div className="common-layout-header-title-container">
          <Breadcrums />
          <h2>
            {pageTitle}
            {text && (
              <span
                className="common-layout-header-title-container-sub-title"
                style={{ color: textColor, backgroundColor }}
              >
                {text}
              </span>
            )}
          </h2>
        </div>
        <div className="common-layout-header-user-container">
          <div>
            <img src={user.image || '/avatar.svg'} alt={user.name || 'User'} />
          </div>
        </div>
      </div>
      <HeaderActions items={buttonList} />
    </>
  );
}

export default LayoutHeader;
