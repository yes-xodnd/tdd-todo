import { BookmarkNode } from "src/constants/types";
import styled from "styled-components";
import FolderListItem from "./FolderTreeNode";

interface Props {
  rootNode: BookmarkNode;
  handleClickTitle: Function;
}

const FolderTree = ({ rootNode, handleClickTitle }: Props) => {

  return (
    <Wrapper>
      {
        rootNode.children &&
        rootNode.children
        .map(node => (
          <FolderListItem 
            node={node} 
            key={node.id} 
            handleClickTitle={handleClickTitle} />)
        )
      }
    </Wrapper>
  ); 
};

export default FolderTree;

const Wrapper = styled.div`
  min-width: 200px;
  max-width: 250px;
  border-radius: 1rem;
  padding: 1rem;
  background: white;
`;