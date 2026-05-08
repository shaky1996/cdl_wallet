import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors } from '../constants/colors';

export default function InfoBanner({
    text,
    color = colors.blue,
    backgroundColor = '#1a1f2e',
    style,
    textStyle
}) {
    return (
        <View
            style={[
                styles.infoBanner,
                {
                    borderColor: color,
                    backgroundColor
                },
                style
            ]}
        >
            <Text style={[styles.infoText, { color }, textStyle]}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    infoBanner: {
        borderRadius: 12,
        borderWidth: 0.5,
        padding: 12
    },

    infoText: {
        fontSize: 12,
        lineHeight: 18
    }
});
