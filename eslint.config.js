import eslintConfigCodely from "eslint-config-codely";

export default [
    { ignores: ["eslint.config.js"] },
    ...eslintConfigCodely.ts,
    {
        rules: {
            "import/no-unresolved": "off",
            "import/no-duplicates": "off",
            "no-console": "off",
            "no-await-in-loop": "off",
        },
    },
];
