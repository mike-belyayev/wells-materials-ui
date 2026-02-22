// src/components/EquipmentPage/WellColumn.tsx
import { useState } from 'react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import { Add, ExpandMore, ExpandLess } from '@mui/icons-material';
import type { Well } from '../../types';
import './WellColumn.css';

interface WellColumnProps {
  well: Well;
  columnCount: number;
  onAddPhase: (well: Well) => void;
  onAddItem: (well: Well, phaseIndex: number, subPhaseIndex: number) => void;
  isAdmin: boolean;
}

const WellColumn: React.FC<WellColumnProps> = ({
  well,
  columnCount,
  onAddPhase,
  onAddItem,
  isAdmin
}) => {
  const [expandedPhases, setExpandedPhases] = useState<{[key: string]: boolean}>({});
  const [expandedSubPhases, setExpandedSubPhases] = useState<{[key: string]: boolean}>({});
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});

  const togglePhase = (phaseIndex: number) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseIndex]: !prev[phaseIndex]
    }));
  };

  const toggleSubPhase = (phaseIndex: number, subPhaseIndex: number) => {
    const key = `${phaseIndex}-${subPhaseIndex}`;
    setExpandedSubPhases(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Calculate grid column class based on columnCount
  const getGridClass = () => {
    switch(columnCount) {
      case 1: return 'single-column';
      case 2: return 'two-columns';
      case 3: return 'three-columns';
      case 4: return 'four-columns';
      default: return 'two-columns';
    }
  };

  return (
    <Box className="well-column">
      {/* Well Info Bar */}
      <Box className="well-info-bar">
        <Typography variant="caption" className="well-afe">
          AFE: {well.wellAFE}
        </Typography>
        <Typography variant="caption" className="well-owner">
          Owner: {well.wellOwner}
        </Typography>
      </Box>

      {/* Phases Container with dynamic columns */}
      <Box className={`phases-container ${getGridClass()}`}>
        {well.wellPhases?.map((phase, phaseIndex) => (
          <Box key={phaseIndex} className="phase-card">
            <Box className="phase-header" onClick={() => togglePhase(phaseIndex)}>
              <Typography variant="subtitle2" className="phase-name">
                {phase.phaseName}
              </Typography>
              <IconButton size="small" className="expand-btn">
                {expandedPhases[phaseIndex] ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            <Collapse in={expandedPhases[phaseIndex] !== false}>
              <Box className="subphases-container">
                {phase.subPhases?.map((subPhase, subPhaseIndex) => (
                  <Box key={subPhaseIndex} className="subphase-card">
                    <Box 
                      className="subphase-header" 
                      onClick={() => toggleSubPhase(phaseIndex, subPhaseIndex)}
                    >
                      <Typography variant="body2" className="subphase-name">
                        {subPhase.subPhaseName}
                      </Typography>
                      <IconButton size="small" className="expand-btn">
                        {expandedSubPhases[`${phaseIndex}-${subPhaseIndex}`] ? 
                          <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>

                    <Collapse in={expandedSubPhases[`${phaseIndex}-${subPhaseIndex}`] !== false}>
                      <Box className="items-container">
                        {subPhase.items?.map((item, itemIndex) => (
                          <Box key={itemIndex} className="item-card">
                            <Box 
                              className="item-content" 
                              onClick={() => toggleItem(`${phaseIndex}-${subPhaseIndex}-${itemIndex}`)}
                            >
                              {item.itemQuantity && (
                                <Typography variant="caption" className="item-quantity">
                                  {item.itemQuantity}
                                </Typography>
                              )}
                              
                              <Typography 
                                variant="body2" 
                                className={`item-name ${expandedItems[`${phaseIndex}-${subPhaseIndex}-${itemIndex}`] ? 'expanded' : ''}`}
                              >
                                {item.itemName}
                                {expandedItems[`${phaseIndex}-${subPhaseIndex}-${itemIndex}`] && (
                                  <span className="item-description">
                                    {item.itemDescription}
                                  </span>
                                )}
                              </Typography>

                              {item.itemLocation && (
                                <Typography variant="caption" className="item-location">
                                  {item.itemLocation}
                                </Typography>
                              )}
                            </Box>

                            {expandedItems[`${phaseIndex}-${subPhaseIndex}-${itemIndex}`] && (
                              <Box className="item-details">
                                {item.itemState && (
                                  <Typography variant="caption" className="item-state">
                                    State: {item.itemState}
                                  </Typography>
                                )}
                                {item.itemComment && (
                                  <Typography variant="caption" className="item-comment">
                                    Note: {item.itemComment}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>
                        ))}

                        {/* Add Item Button */}
                        {isAdmin && (
                          <Box className="add-item-container">
                            <IconButton
                              size="small"
                              onClick={() => onAddItem(well, phaseIndex, subPhaseIndex)}
                              className="add-item-btn"
                            >
                              <Add fontSize="small" />
                            </IconButton>
                            <Typography variant="caption">Add Item</Typography>
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        ))}
      </Box>

      {/* Add Phase Button */}
      {isAdmin && (
        <Box className="add-phase-container">
          <IconButton onClick={() => onAddPhase(well)} className="add-phase-btn">
            <Add />
          </IconButton>
          <Typography variant="caption">Add Phase</Typography>
        </Box>
      )}
    </Box>
  );
};

export default WellColumn;