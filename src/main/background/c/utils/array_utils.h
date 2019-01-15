#ifndef TESTC_ARRAY_UTILS_H
#define TESTC_ARRAY_UTILS_H

void push(void **array, void **value, uint32_t *size, uint32_t *capacity);
static void swap(void **a, void **b);
void splice(void **array, uint32_t index, uint32_t *size, bool shouldFreePointer);

#endif
