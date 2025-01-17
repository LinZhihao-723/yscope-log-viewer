const PROTOCOL = {
    FOUR_BYTE_ENCODING_MAGIC_NUMBER: [0xFD, 0x2F, 0xB5, 0x29],
    METADATA: {
        VERSION_KEY: "VERSION",
        VERSION_VALUE: "0.1.0-alpha.0",
        REFERENCE_TIMESTAMP_KEY: "REFERENCE_TIMESTAMP",
        TIMESTAMP_PATTERN_KEY: "TIMESTAMP_PATTERN",
        ATTRIBUTE_TABLE_KEY: "ATTRIBUTES",
        ANDROID_BUILD_VERSION_KEY: "ANDROID_BUILD_VERSION",
        TZ_ID_KEY: "TZ_ID",
        JSON_ENCODING: 0x1,
        METADATA_LEN_UBYTE: 0x11,
        METADATA_LEN_USHORT: 0x12,
        METADATA_LEN_INT: 0x13,
    },

    ATTRIBUTE: {
        NAME_KEY: "name",
        TYPE_KEY: "type",
    },

    PAYLOAD: {
        EOF: 0x0,

        ATTR_NULL: 0x40,

        ATTR_NUM_BYTE: 0x41,
        ATTR_NUM_SHORT: 0x42,
        ATTR_NUM_INT: 0x43,
        ATTR_NUM_LONG: 0x44,

        ATTR_STR_LEN_BYTE: 0x45,
        ATTR_STR_LEN_SHORT: 0x46,
        ATTR_STR_LEN_INT: 0x47,

        VAR_STR_LEN_UNSIGNED_BYTE: 0x11,
        VAR_STR_LEN_UNSIGNED_SHORT: 0x12,
        VAR_STR_LEN_SIGNED_INT: 0x13,
        VAR_FOUR_BYTE_ENCODING: 0x18,

        LOGTYPE_STR_LEN_UNSIGNED_BYTE: 0x21,
        LOGTYPE_STR_LEN_UNSIGNED_SHORT: 0x22,
        LOGTYPE_STR_LEN_SIGNED_INT: 0x23,

        TIMESTAMP_DELTA_SIGNED_BYTE: 0x31,
        TIMESTAMP_DELTA_SIGNED_SHORT: 0x32,
        TIMESTAMP_DELTA_SIGNED_INT: 0x33,
        TIMESTAMP_DELTA_SIGNED_LONG: 0x34,
        TIMESTAMP_NULL: 0x3F,
        // NOTE: JavaScript only supports 53-bit numbers safely, so we have to
        //       use BigInt for 64-bit numbers.
        TIMESTAMP_NULL_VAL: BigInt("-9223372036854776000"),

        isNotVar: (tag) => {
            return (tag >> 4) !== 0x1;
        },

        isNotAttr: (tag) => {
            return (tag >> 4) !== 0x4;
        },
    },
};

export default PROTOCOL;
