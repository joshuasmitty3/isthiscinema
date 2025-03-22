
# Movie List Components Unification Plan

## Phase 1: Unified MovieCard Component
1. Create unified card structure with actionType prop
2. Implement conditional action buttons:
   - Worth watching: Watch + Remove
   - Already watched: Review
3. Test each action type separately
4. Add logging for state updates

Success Criteria:
- All buttons work as expected
- State updates logged correctly
- Visual consistency maintained

## Phase 2: Review System Integration
1. Add review modal component
2. Implement review submission logic
3. Add review display component
4. Add state logging

Success Criteria:
- Review submission works
- Reviews display correctly
- State changes logged

## Phase 3: CSV Export Functionality
1. Create export utility module
2. Implement data formatting
3. Add download functionality
4. Add validation checks

Success Criteria:
- CSV downloads correctly
- Data format is valid
- Error states handled

## Phase 4: List Management Logic
1. Create unified list management hooks
2. Implement state updates
3. Add list transition logic
4. Implement logging system

Success Criteria:
- Lists update correctly
- Transitions work smoothly
- Changes logged properly

## Phase 5: UI Polish & Testing
1. Test drag-and-drop functionality
2. Verify all transitions
3. Test error states
4. Run integration tests

Success Criteria:
- Smooth drag-and-drop
- Clean transitions
- Error handling works
- All features integrated

## Notes
- Each phase can be tested independently
- Console logs track state changes
- Visual verification required
- Error handling verified at each step
