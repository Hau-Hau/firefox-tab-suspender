#ifndef FTS_ARRAY_UTILS_H
#define FTS_ARRAY_UTILS_H


typedef struct {
    void (*const swap)(void **a, void **b);

    void (*const push)(void **array, void **value, uint32_t *size, uint32_t *capacity);

    void (*const splice)(void **array, uint32_t index, uint32_t *size, bool shouldFreePointer);
} array_utils_namespace;

extern array_utils_namespace const ArrayUtils;


#endif
