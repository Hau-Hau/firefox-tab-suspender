#ifndef FTS_DYNAMIC_ARRAY_H
#define FTS_DYNAMIC_ARRAY_H

struct DynamicArray {
    uint32_t getSize();

    uint32_t getCapacity();

    void initialize(void **object);

    void **getObject();

    void push(void **value);

    void splice(uint32_t index, bool shouldFreePointer);
};

#endif
