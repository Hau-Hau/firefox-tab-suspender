#include <stdio.h>
#include <malloc.h>
#include <stdlib.h>
#include <stdint.h>
#include <stdbool.h>
#include "array_service.h"

static void swap(void **a, void **b) {
    void *t = *b;
    *b = *a;
    *a = t;
}

static void push(void **array, void **value, uint32_t *size, uint32_t *capacity, bool allowDuplicates) {
    if (!allowDuplicates) {
        uint32_t index = *size;
        while (index--) {
            if (array[index] == *value) {
                return;
            }
        }
    }
    if (*size == *capacity) {
        *capacity = *capacity * 2;
        void *ptr = realloc(*array, *capacity);
    }

    array[*size] = *value;
    (*size)++;
}

static void splice(void **array, uint32_t index, uint32_t *size, bool shouldFreePointer) {
    if (index >= *size) {
        return;
    }

    uint32_t arrayIndex = *size;
    while (arrayIndex--) {
        if (arrayIndex <= index) {
            break;
        }

        if (array[index] == NULL) {
            continue;
        }

        for (uint32_t i = index; i < *size - 1; i++) {
            swap(&array[i], &array[i + 1]);
        }
        break;
    }
    (*size)--;

    if (array[*size] != NULL) {
        if (shouldFreePointer) {
            free(array[*size]);
        }
        array[*size] = NULL;
    }
}

array_service_namespace const ArrayService = {
        swap,
        push,
        splice
};

