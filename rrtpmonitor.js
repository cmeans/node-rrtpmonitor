#!/usr/local/bin/node

var fs = 
    require(
        'fs');

var Resilient = 
    require(
        'resilient');

// Runtime configuration.
var config = 
    require(
        './config.json');

var rrtpClient = 
    Resilient(
        {
            service: 
            {
                basePath: config.rrtp.path,
                servers: config.rrtp.servers,
                timeout: 5000,
                retry: 5,
                waitBeforeRetry: 1 * 1000
            }
        });

var makerClient = 
    Resilient(
        {
            service: 
            {
                basePath: config.maker.path,
                servers: config.maker.servers,
                timeout: 5000,
                retry: 5,
                waitBeforeRetry: 1 * 1000
            }
        });

function getLastThresholdName()
{
    try
    {
        return fs.readFileSync(
            config.lastThresholdFileName, 
            'utf8');
    }
    catch (E)
    {
        return "N/A";
    }
}

function getRate(cb)
{
    rrtpClient.get(
        null,
        function (err, res) 
        {
            if (err) 
            {
                return cb(
                    err, 
                    null);
            }
            
            if (res.status == 200)
            {
                return cb(
                    null, 
                    JSON.parse(
                        res.data));
            }

            cb("No data from ComEd");
        });
}

function setLastThresholdName(thresholdName)
{
    fs.writeFile(
        config.lastThresholdFileName, 
        thresholdName, 
        function(err) 
        {
            if (err) 
            {
                console.log(err);
            } 
        });
}

function getThresholdFromRate (rate)
{
    var threshold = 
        { 
            name: "N/A", 
            value: -99,
            color: "black" 
        };
    
    config.thresholds.some(
        function(item)
        {
            if (rate <= item.value)
            {
                threshold = item;
                
                return true;
            }
        });
    
    return threshold;
}

function reportThresholdChange (threshold, rate, cb)
{
    makerClient.post(
        null,
        {
            params:
            {
                value1: threshold.name,
                value2: rate,
                value3: threadhold.color
            }
        },
        function (err)
        {
            if (err) 
            {
                console.log(
                    err);
            } 
            
            cb();
        });
}

function check()
{
    getRate(
        function(err, rate)
        {
            if (err)
            {
                console.log(err);
                
                return;
            }
            
            var price = rate[0].price;
            
            var currentThreshold = 
                getThresholdFromRate(
                    price);
            
            var lastThresholdName = 
                getLastThresholdName();

            if (lastThresholdName != currentThreshold.name)
            {
                setLastThresholdName(
                    currentThreshold.name);
                
                reportThresholdChange(
                    currentThreshold, 
                    price,
                    function()
                    {
                        /*
                        console.log("Last threshold was: " + lastThreshold);
                        console.log("Current threshold is: " + currentThreshold);
                        */
                    });
            }
        });
}

check();
